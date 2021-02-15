import React from 'react';

const Movie = ({name,director, imdb_score, genre} ) => (
    <div className="movie">
        <div className="movie-header">
            <img src="https://m.media-amazon.com/images/M/MV5BNDJiZDliZDAtMjc5Yy00MzVhLThkY2MtNDYwNTQ2ZTM5MDcxXkEyXkFqcGdeQXVyMDA4NzMyOA@@._V1_.jpg" alt={name}></img>
            <div className="movie-info">
                <h3>{name}</h3>
                <span>{imdb_score}</span>
            </div>

            <div className="movie-over">
                <h2>Details</h2>
                <div>
                    <ul>
                        <li>Director: {director} </li>
                        <li>Genre: {genre.join(',')} </li>
                    </ul>
                </div>
            </div>
        </div>

    </div>)
;

export default Movie;
