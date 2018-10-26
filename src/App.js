import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Game from "./components/Game";
import Particles from "./components/Particles";

const App = () => (
  <Router>
    <div>
      <Route exact path="/" render={props => <Game {...props} mode="dots" />} />
      <Route
        exact
        path="/cursor"
        render={props => <Game {...props} mode="cursor" />}
      />
      <Route
        path="/vector-field"
        render={props => <Game {...props} mode="vector" />}
      />
      <Route
        path="/self-motion"
        render={props => <Game {...props} mode="self-motion" />}
      />
      <Route path="/particles" render={props => <Particles {...props} />} />
      <Route
        path="/global-motion"
        render={props => <Particles globalMotion {...props} />}
      />
      <Route
        path="/particles-spatial"
        render={props => <Particles mode="spatial" {...props} />}
      />

      <nav>
        <span>
          <Link to="/">Game</Link>
        </span>
        {" | "}
        <span>
          <Link to="/vector-field">Vector Field</Link>
        </span>
        {" | "}
        <span>
          <Link to="/particles">Particles</Link>
        </span>
        {" | "}
        <span>
          <Link to="/particles-spatial">spatial</Link>
        </span>
      </nav>
    </div>
  </Router>
);

export default App;
