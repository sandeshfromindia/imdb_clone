import React, {useEffect, useState} from 'react';
import config from './config.json'
import Movie from "./components/Movie";
import Topbar from "./components/Topbar";
import logo from './IMDB_Logo_2016.svg';
import {stringify} from "query-string";

function App() {
    const [movies, setMovies] = useState([]);
    const [searchTerm, setSearchTerm] = useState([]);

    useEffect(() => {
        fetch(config.SERVER_URL + 'movies', {
            method: 'GET',
            // body: JSON.stringify({ "email": username, password}),
            headers: new Headers({
                'Content-Type': 'application/json',
                "x-api-key": config.API_KEY
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                setMovies(data.data.movies);
            });
    }, []);

    const handlerOnchange = (e) => {
        setSearchTerm(e.target.value);
    }

    const handlerOnSubmit = (e) => {
        e.preventDefault();
        if (searchTerm) {
            const query = {
                filter: JSON.stringify(searchTerm),
            };
            fetch(`${config.SERVER_URL}movies?${stringify(query)}`, {
                method: 'GET',
                // body: JSON.stringify({ "email": username, password}),
                headers: new Headers({
                    'Content-Type': 'application/json',
                    "x-api-key": config.API_KEY
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    data.data? setMovies(data.data.movies):setMovies([]);
                });
        } else {

            fetch(config.SERVER_URL + 'movies', {
                method: 'GET',
                // body: JSON.stringify({ "email": username, password}),
                headers: new Headers({
                    'Content-Type': 'application/json',
                    "x-api-key": config.API_KEY
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    setMovies(data.data.movies);
                });

        }

    }

    return (
        <>
            <header>
                <img src={logo} className="App-logo" alt="logo"/>
                <form onSubmit={handlerOnSubmit}>
                    <input
                        className="search"
                        type="search"
                        placeholder="Search Movie"
                        onChange={handlerOnchange}
                        value={searchTerm}
                    />
                </form>

            </header>
            <div className="movie-container">
                {movies.map((movie) => (
                    <Movie key={movie.name} {...movie}/>
                ))}
            </div>
        </>

    )
}

export default App;
