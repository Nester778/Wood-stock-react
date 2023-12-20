const express = require("express");
const mongoose = require("mongoose");
const multer = require('multer');
const Prod = require("./model/prodSchema");
const cors = require('cors');

const PORT = "8080";

const app = express();
app.use(cors());

mongoose.connect('mongodb+srv://Admin:NesTerenko778@cluster0.quoajxp.mongodb.net/')
    .then(() => {
        console.log("open");
    }).catch(err => {
        console.log("fail");
    });


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.post('/upload', upload.array('images', 10), async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No images uploaded' });
    }

    try {
        let imgArr = [];
        const savedImages = await Promise.all(
            req.files.map(async (file) => {
                imgArr.push(file.buffer);
            })
        );

        const newImage = new Prod({
            Price: req.body.productPrice,
            Name: req.body.productName,
            Description: req.body.productDescription,
            Material: req.body.productMaterial,
            Coating: req.body.productCoating,
            data: imgArr,
        });

        await newImage.save();
        res.status(200).json({ message: 'Images uploaded and saved successfully' });
    } catch (error) {
        console.error('Error saving images:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.delete('/products/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        const result = await Prod.deleteOne({ _id: new mongoose.Types.ObjectId(productId) });

        if (result.deletedCount === 1) {
            res.status(200).json({ message: 'Product deleted successfully' });
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/products/:id', async (req, res) => {
    const productId = req.params.id;
    const product = await Prod.findById(productId);

    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
});

app.get('/catalog', async (req, res) => {
    try {
        let filter = {};
        if (req.query.minPrice) {
            filter.Price = { $gte: parseFloat(req.query.minPrice) };
        }
        if (req.query.maxPrice) {
            if (filter.Price) {
                filter.Price.$lte = parseFloat(req.query.maxPrice);
            } else {
                filter.Price = { $lte: parseFloat(req.query.maxPrice) };
            }
        }
        if (req.query.coating) {
            filter.Coating = req.query.coating;
        }
        if (req.query.material) {
            filter.Material = req.query.material;
        }
        if (req.query.search) {
            filter.Name = new RegExp(req.query.search, 'i');
        }

        const products = await Prod.find(filter);
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.listen(PORT, (req, res) => {
    console.log("hi");
});