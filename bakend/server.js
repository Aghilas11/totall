const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const port = 5000;
const fs = require("fs");
const imageModel = require("./models");
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose
  .connect(
    "mongodb+srv://aghilaslisa53:Panzer2018@uploadimg.1bbviqr.mongodb.net/uploadImg",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("connected successfully"))
  .catch((err) => console.log("it has an error", err));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/", upload.single("testImage"), (req, res) => {
  const saveImage = imageModel({
    name: req.body.name,
    title: req.body.title, // Récupération du titre depuis la requête
    description: req.body.description, // Récupération de la description depuis la requête
    img: {
      data: fs.readFileSync("uploads/" + req.file.filename),
      contentType: "image/png",
    },
  });
  saveImage
    .save()
    .then(() => {
      console.log("image is saved");
      res.send("Image is saved");
    })
    .catch((err) => {
      console.log(err, "error has occurred");
      res.status(500).send("Error occurred while saving image");
    });
});

app.get("/", async (req, res) => {
  const allData = await imageModel.find();
  res.json(allData);
});
app.delete("/:id", (req, res) => {
  const imageId = req.params.id;

  // Utilisez Mongoose pour rechercher l'image par ID et la supprimer
  imageModel
    .findByIdAndRemove(imageId)
    .then((image) => {
      if (!image) {
        res.status(404).send("Image introuvable");
      } else {
        res.send("Image supprimée avec succès");
      }
    })
    .catch((err) => {
      console.error("Erreur lors de la suppression de l'image :", err);
      res.status(500).send("Erreur lors de la suppression de l'image");
    });
});

app.put("/:id", async (req, res) => {
  const imageId = req.params.id;

  try {
    // Recherchez l'image par ID dans la base de données
    const imageToUpdate = await imageModel.findById(imageId);

    if (!imageToUpdate) {
      return res.status(404).send("Image introuvable");
    }

    // Mettez à jour les propriétés de l'image (description et titre)
    if (req.body.title) {
      imageToUpdate.title = req.body.title;
    }
    if (req.body.description) {
      imageToUpdate.description = req.body.description;
    }

    // Enregistrez la mise à jour de l'image
    await imageToUpdate.save();

    res.send("Image mise à jour avec succès");
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'image :", error);
    res.status(500).send("Erreur lors de la mise à jour de l'image");
  }
});

app.listen(port, () => {
  console.log("server running successfully");
});
