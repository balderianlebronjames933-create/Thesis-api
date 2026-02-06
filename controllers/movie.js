const Movie = require("../models/Movie");

exports.addMovie = async (req, res, next) => {
  try {
    const { title, director, year, description, genre } = req.body;

    const movie = new Movie({
      title,
      director,
      year,
      description,
      genre
    });

    const savedMovie = await movie.save();

    res.status(201).json(savedMovie); 
  } catch (err) {
    next(err);
  }
};

exports.getMovies = async (req, res, next) => {
  try {
    const allMovies = await Movie.find().populate('comments.userId', 'email');
    res.status(200).json({ movies: allMovies });  
  } catch (err) {
    next(err);
  }
};

exports.getMovie = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.movieId);
        res.status(200).json(movie);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateMovie = async (req, res) => {
    try {
        const { title, director, year, description, genre } = req.body;
        const updated = await Movie.findByIdAndUpdate(req.params.movieId, { title, director, year, description, genre }, { new: true });
        res.status(200).json({message: "Movie updated successfully", updatedMovie: updated});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteMovie = async (req, res) => {
    try {
        await Movie.findByIdAndDelete(req.params.movieId);
        res.status(200).json({ message: "Movie deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addComment = async (req, res, next) => {
  try {
    const { comment } = req.body;
    const { movieId } = req.params;
    const userId = req.user.id;

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    const newComment = {
      userId,
      comment
    };

    movie.comments.push(newComment);
    const updatedMovie = await movie.save();

    res.status(200).json({
      message: "comment added successfully",
      updatedMovie
    });
  } catch (err) {
    next(err);
  }
};


exports.getComments = async (req, res, next) => {
  try {
    const { movieId } = req.params;

    const movie = await Movie.findById(movieId)
    .select("comments")
    .populate("comments.userId", "email"); 


    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.status(200).json({ comments: movie.comments });
  } catch (err) {
    next(err);
  }
};