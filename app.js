const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// GET Movies API

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `SELECT * FROM movie;`;
  const dbResponse = await db.all(getMoviesQuery);
  const output = dbResponse.map((each) => ({
    movieId: each.movie_id,
    directorId: each.director_id,
    movieName: each.movie_name,
    leadActor: each.lead_actor,
  }));
  response.send(output);
});

// Create Movies API
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, leadActor, movieName } = movieDetails;
  const createMovieQuery = `INSERT INTO movie (director_id, lead_actor, movie_name) VALUES(${directorId}, '${leadActor}', '${movieName}');`;
  const dbResponse = await db.run(createMovieQuery);
  const movieId = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

// GET Movie API
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT * FROM movie WHERE movie_id = ${movieId};`;
  const dbResponse = await db.get(getMovieQuery);

  const output = {
    movieId: dbResponse.movie_id,
    directorId: dbResponse.director_id,
    movieName: dbResponse.movie_name,
    leadActor: dbResponse.lead_actor,
  };
  response.send(output);
});

// Update Movie API
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `UPDATE movie SET director_id=${directorId}, movie_name='${movieName}', lead_actor='${leadActor}';`;
  const dbResponse = await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

// DELETE Movie API
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `DELETE FROM movie WHERE movie_id = ${movieId};`;
  const dbResponse = await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

// GET Directors API
app.get("/directors/", async (request, response) => {
  const getDirectors = `SELECT * FROM director ;`;
  const dbResponse = await db.all(getDirectors);

  const output = dbResponse.map((each) => ({
    directorId: each.director_id,
    directorName: each.director_name,
  }));
  response.send(output);
});

// GET Specific Director Movies API
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const directorSpecificMoviesQuery = `SELECT movie_name as movieName FROM movie WHERE director_id = ${directorId};`;
  const dbResponse = await db.all(directorSpecificMoviesQuery);
  response.send(dbResponse);
});

module.exports = app;
