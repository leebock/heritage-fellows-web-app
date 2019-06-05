# heritage-fellows-web-app

This repo contains the application files for the [NEA National Heritage Fellows Map](https://storymaps.esri.com/stories/2017/heritage-fellows/map.html).  It is a custom application, built as a Story Maps Labs effort in cooperation with the Smithsonian Center for Folklife and Cultural Heritage.  

## Deployment

The primary file types in this repo are **html**, **css**, and **javascript**.  To deploy, simply copy the folder to a web server directory.

## Notes for developers

* This is a simple [JAMstack](https://jamstack.org/) project, consisting only of vanilla javascript (no frameworks)

* The *html*, *css*, and *javascript* files in this project require no build scripts.  Source files can be edited and re-deployed with modifications.

	* Note: *Css* developers have an alternative to working with the css code directly. If you're familiar with [Sass](https://sass-lang.com/) (which we use for convenience in developing our css), you can work with the *scss* source files provided (in the *scss* folder).

* The data files for this application are stored in a separate repo.  By default, the application uses these file paths:
	* https://arcgis.github.io/storymaps-heritage-fellows-data/artists.csv
	* https://arcgis.github.io/storymaps-heritage-fellows-data/works.csv
	
You may encounter cross domain issues with your deployment.  If that is the case, you can simply download these data files and host time along with the application files.  The relevant code for pointing to a different path can be found in main.js:


			```
	const SPREADSHEET_URL_ARTISTS = ...
	const SPREADSHEET_URL_WORKS = ...
			```


* Files you can ignore:
	* *Gruntfile.js*: A file that I use to automate some tasks in my own environment.  This file does not directly relate to the mechanics of the application.
	* Source *scss* files in the *scss* folder. If you're not using Sass, you needn't worry about these.
