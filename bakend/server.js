const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const port = 5000;
const fs = require("fs");
require("dotenv").config();

const imageModel = require("./models");
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("connexion réussie"))
  .catch((err) => console.log("une erreur est produite", err));

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
    title: req.body.title,
    description: req.body.description,
    img: {
      data: fs.readFileSync("uploads/" + req.file.filename),
      contentType: "image/png",
    },
    kilometerage: req.body.kilometerage,
    year: req.body.year,
    price: req.body.price,
    fuel: req.body.fuel,
  });
  saveImage
    .save()
    .then(() => {
      console.log("image sauvegardé");
      res.send("Image sauvegardé");
    })
    .catch((err) => {
      console.log(err, "une erreur s'est produite");
      res
        .status(500)
        .send("une erreur s'est produite lors du sauvegarde de l'image");
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
    // Rechercher l'image par ID dans la base de données
    const imageToUpdate = await imageModel.findById(imageId);

    if (!imageToUpdate) {
      return res.status(404).send("Image introuvable");
    }

    // Mettre à jour les propriétés de l'image (description et titre)
    if (req.body.title) {
      imageToUpdate.title = req.body.title;
    }
    if (req.body.description) {
      imageToUpdate.description = req.body.description;
    }

    // Enregistrer la mise à jour de l'image
    await imageToUpdate.save();

    res.send("Image mise à jour avec succès");
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'image :", error);
    res.status(500).send("Erreur lors de la mise à jour de l'image");
  }
});

app.listen(port, () => {
  console.log("serveur connecté");
});
