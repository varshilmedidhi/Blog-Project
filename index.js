import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';

const app = express();

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Create a PostgreSQL client
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "world",
    password: "Vanshika@2014",
    port: 5432,
});
db.connect();

// Serve static files from the "public" directory
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

let length = 0;
let from_edit = false;

// Routes
app.get('/', async (req, res) => {
    try {
        let new_data = await db.query("SELECT * FROM blog_content");
        length = new_data.rows.length;
        res.render("index", { data: new_data.rows });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/new", (req, res) => {
    from_edit = false;
    res.render("edit", { data: {} });
});

app.post("/edit", async (req, res) => {
    try {
        let user_data = req.body;
        from_edit = true;
        let edit_data = await db.query("SELECT * FROM blog_content WHERE id = $1", [user_data.id]);
        res.render("edit", { data: edit_data.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/save", async (req, res) => {
    try {
        let user_data = req.body;
        if (from_edit) {
            await db.query(
                "UPDATE blog_content SET heading = $1, body = $2, author = $3 WHERE id = $4",
                [user_data.header, user_data.body, user_data.author, user_data.id]
            );
        } else {
            length += 1;
            await db.query(
                "INSERT INTO blog_content (id, heading, body, author) VALUES ($1, $2, $3, $4)",
                [length, user_data.header, user_data.body, user_data.author]
            );
        }
        res.redirect("/");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});



app.post("/delete",async (req,res)=>{
    let id=req.body.id;
    db.query("DELETE FROM blog_content WHERE id=$1",[id]);
    res.redirect("/");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
