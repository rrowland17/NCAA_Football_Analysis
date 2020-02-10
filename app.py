# import necessary libraries
import os

import json
import pandas as pd
import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy

#Need to process these into new requirements:
from sklearn.externals import joblib
from sklearn.pipeline import make_pipeline
from sklearn.base import BaseEstimator, TransformerMixin

class PandasDummies(BaseEstimator, TransformerMixin):
    def transform(self, X, *_):
        return pd.get_dummies(X)
    
    def fit(self, *_):
        return self

app = Flask(__name__)

#################################################
# Database Setup
#################################################

#app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db/cleaned_team_stats.sqlite"
#DATABASE_URI = 'postgres+psycopg2://postgres:changeme@localhost:5432/team_stats'
#engine = sqlalchemy.create_engine(DATABASE_URI)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db/cleaned_team_stats.sqlite"

db = SQLAlchemy(app)



# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(db.engine, reflect=True)

# Save references to each table
#print(Base.classes.keys())
Teamstats = Base.classes.cleaned_team_stats
col=["team_id",
    "variable",
    "first_downs",
    "first_downs_by_penalty",
    "third_down_percentage",
    "fourth_down_percentage",
    "average_interception_yards",
    "average_kickoff_return_yards",
    "average_punt_return_yards",
    "interceptions", 
    "net_average_punt_yards", 
    "net_passing_yards", 
    "net_passing_yards_per_game",
    "passing_first_downs",
    "passing_touchdowns",
    "rushing_first_downs",
    "rushing_attempts", 
    "rushing_touchdowns",
    "rushing_yards", 
    "rushing_yards_per_game", 
    "total_offensive_plays",
    "total_points" ,
    "total_points_per_game" ,
    "total_touchdowns" ,
    "total_offensive_yards", 
    "yards_per_game" ,
    "yards_per_pass_attempt", 
    "yards_per_rush_attempt" ,
    "completed_passes" ,
    "attempted_passes" ,
    "field_goals_completed" ,
    "field_goals_attempted" ,
    "total_fumbles" ,
    "defensive_interception" ,
    "yards_after_interception" ,
    "total_kickoffs_received", 
    "yards_off_kickoff_received" ,
    "total_punts_received" ,
    "yards_off_punts_received" ,
    "total_punts_kicked", 
    "total_punt_yards" ,
    "total_defensive_sacks" ,
    "yards_lost_from_sacks" ,
    "total_penalties" ,
    "total_yards_penalized"]
 
# create route that renders index.html template
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/variable")
def variable():
    """Return a list of variable."""

    #Query for the variable
    
    results = db.session.query(Teamstats.variable.distinct().label("variable"))
    variable = [row.variable for row in results.all()]
    returnvariable=[]
    for x in variable:
        if x != None:
            returnvariable.append(x)
    returnvariable.sort(reverse = True)
    
            

    #Return a list of the column names (variable names)
    return jsonify(returnvariable)


@app.route("/index.html")
def home_1():
    return render_template("index.html")
@app.route("/contact.html")
def contact():
    return render_template('contact.html')
@app.route("/left-sidebar.html")
def left():
    return render_template("left-sidebar.html")
@app.route("/right-sidebar.html")
def right():
    return render_template("right-sidebar.html")
@app.route("/no-sidebar.html")
def none():
    return render_template("no-sidebar.html")
@app.route("/sidebar-two.html")
def two():
    return render_template("sidebar-two.html")    

@app.route("/api")
def api():
    return render_template("apidocumentation.html")
@app.route("/api/teamList")
def teamList():
    return
@app.route("/api/all")
def all():
    """Return a list of variable."""
    #Query for the variable
    
    results = db.session.query(Teamstats.team_id, 
    Teamstats.variable,
    Teamstats.first_downs,
    Teamstats.first_downs_by_penalty,
    Teamstats.third_down_percentage,
    Teamstats.fourth_down_percentage,
    Teamstats.average_interception_yards, 
    Teamstats.average_kickoff_return_yards,
    Teamstats.average_punt_return_yards, 
    Teamstats.interceptions, 
    Teamstats.net_average_punt_yards,
    Teamstats.net_passing_yards, 
    Teamstats.net_passing_yards_per_game, 
    Teamstats.passing_first_downs, 
    Teamstats.passing_touchdowns,
    Teamstats.rushing_first_downs, 
    Teamstats.rushing_attempts, 
    Teamstats.rushing_touchdowns, 
    Teamstats.rushing_yards, 
    Teamstats.rushing_yards_per_game,
    Teamstats.total_offensive_plays, 
    Teamstats.total_points, 
    Teamstats.total_points_per_game, 
    Teamstats.total_touchdowns,
    Teamstats.total_offensive_yards, 
    Teamstats.yards_per_game, 
    Teamstats.yards_per_pass_attempt, 
    Teamstats.yards_per_rush_attempt, 
    Teamstats.completed_passes, 
    Teamstats.attempted_passes, 
    Teamstats.field_goals_completed, 
    Teamstats.field_goals_attempted, 
    Teamstats.total_fumbles, 
    Teamstats.defensive_interception, 
    Teamstats.yards_after_interception, 
    Teamstats.total_kickoffs_received, 
    Teamstats.yards_off_kickoff_received, 
    Teamstats.total_punts_received, 
    Teamstats.yards_off_punts_received,
    Teamstats.total_punts_kicked,
    Teamstats.total_punt_yards, 
    Teamstats.total_defensive_sacks, 
    Teamstats.yards_lost_from_sacks, 
    Teamstats.total_penalties ,
    Teamstats.total_yards_penalized).all()
    variable =pd.DataFrame(results, columns=col)
    variable.set_index("variable", drop=False,  inplace=True)
    return (variable.to_json())


@app.route("/api/team/<name>")
def team(name):
    name=name.casefold().replace(" ", "")
    df=pd.read_json(all())
    df["teamname"]=df["variable"].map(str.casefold)
    df["teamname"]=df["teamname"].str.replace(" ", "")
    results=df.loc[df['teamname'] == name]
    results.drop("teamname", axis=1, inplace=True)
    results.set_index("variable", inplace=True)
    
    return results.to_json()

@app.route("/ml/points/<stat1>/<stat2>/<stat3>/<stat4>/<stat5>")
def points(stat1, stat2, stat3, stat4, stat5):
        #create df with these 5 variables with column names from model
    data={'third_down_percentage': float(stat1),
        'yards_per_pass_attempt':float(stat2),
        'passing_touchdowns':int(stat3),
        'rushing_touchdowns':int(stat4),
        'rushing_yards_per_game':int(stat5),
        }
    df=pd.DataFrame(data, index=[0])
    #import model
    some_totally_random_model = joblib.load("1my_model.pkl")
    #run number with model
    results=some_totally_random_model.predict(df)
    
    #return result as int
    return jsonify(f"We predict that {int(results)} points will be scored based on these stats")

if __name__ == "__main__":
    app.run(debug=True)



