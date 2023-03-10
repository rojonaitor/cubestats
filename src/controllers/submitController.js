const User = require("../models/User");
const Algorithm = require("../models/Algorithm");
const Cube = require("../models/Cube");
const Solve = require("../models/Solve");
const ollAlgorithms = require("../algs/ollAlgs");
const pllAlgorithms = require("../algs/pllAlgs");
const collAlgorithms = require("../algs/collAlgs");

exports.newSolve = async (req, res) => {
  try {
    const { id, cubeName, scramble, solveTime, startDate } = req.body;
    const user = await User.findById(id);
    const cubeSolve = await Cube.findById(cubeName);
    const solve = await Solve.create({
      owner: user._id,
      cube: cubeSolve._id,
      scramble: scramble,
      solveTime: solveTime,
      category: cubeSolve.category,
      brand: cubeSolve.brand,
      startDate: startDate,
    });
    res.json("Successfully added new time");
  } catch (err) {
    console.log(err);
  }
};

exports.deleteSolve = async (req, res, next) => {
  try {
    const user = req.user;
    const solveId = req.params.solveId;
    const deleteSolveId = await Solve.findById(solveId);
    if (!deleteSolveId) {
      return next();
    }
    if (!deleteSolveId.owner.equals(user._id)) {
      throw new Error("That is not your time");
    }
    await deleteSolveId.remove();
    res.redirect(`/${user.username}/historial`);
  } catch (error) {
    console.log(error);
    res.redirect(`/${user.username}/historial`);
  }
};

exports.deleteCube = async (req, res) => {
  try {
    const user = req.user;
    console.log(user);
    const cubeId = req.params.cubeId;
    const deleteCubeId = await Cube.findById(cubeId);
    if (!deleteCubeId.owner.equals(user._id)) {
      throw new Error("That is not your cube");
    }
    await deleteCubeId.remove();
    res.redirect(`/${user.username}/my-cubes`);
  } catch (error) {
    console.log(error);
    res.redirect(`/${user.username}/my-cubes`);
  }
};

exports.updateUserCubes = async (req, res) => {
  try {
    const { name, brand, category } = req.body;
    const userName = req.params.userName;
    const user = await User.findOne({ username: userName });
    if (!user) {
      throw new Error("User not found");
    }

    const cube = await Cube.create({
      owner: user._id,
      name: name,
      brand: brand,
      category: category,
    });

    res.redirect(`/${user.username}/my-cubes`);
  } catch (error) {
    console.log(error);
    res.redirect(`/${user.username}/my-cubes`);
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { name, bio, website, youtube, contactEmail, nationality, theme } =
      req.body;
    console.log(theme);
    const userName = req.params.userName;
    const user = await User.findOne({ username: userName });
    if (!user) {
      throw new Error("User not found");
    }
		
		if (req.file) {
			const { filename } = req.file;
			user.setImgUrl(filename);
		}
		
    user.name = name;
    user.bio = bio;
    user.website = website;
    user.youtube = youtube;
    user.contactEmail = contactEmail;
    user.nationality = nationality;
    user.theme = theme;

    const saveUser = await user.save();

    res.redirect(`/${user.username}`);
  } catch (error) {
    console.log(error);
    res.redirect(`/${user.username}`);
  }
};

exports.updateMethod = async (req, res) => {
  try {
    const method = req.params.method.toUpperCase();
    const userName = req.params.userName;
    const user = await User.findOne({ username: userName });
    if (!user) {
      throw new Error("User not found");
    }

    const validCategories = ["OLL", "PLL", "COLL", "CMLL"];
    const categoryIndex = validCategories.indexOf(method);
    if (categoryIndex === -1) {
      throw new Error(`${method} is not a valid category`);
    }

    const userAlgs = await Algorithm.find({
      algSet: method,
      owner: user._id,
    });

    for (let i = 0; i < userAlgs.length; i++) {
      const alg = userAlgs[i];
      alg.algSet = validCategories[categoryIndex];
      alg.status = req.body[`${method}${i + 1}`];
      await alg.save();
    }

    res.redirect(`/${user.username}/alg-collection`);
  } catch (error) {
    console.log(error);
    res.redirect(`/${user.username}/alg-collection`);
  }
};
