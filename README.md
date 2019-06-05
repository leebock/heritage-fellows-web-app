# heritage-fellows-web-app

This repo contains the application files for the [NEA National Heritage Fellows Map](https://storymaps.esri.com/stories/2017/heritage-fellows/map.html).  It is a custom application, built as a Story Maps Labs effort in cooperation with the Smithsonian Center for Folklife and Cultural Heritage.  

## Deployment

The primary file types in this repo are **html**, **css**, and **javascript**.  To deploy, simply copy the folder to a web server directory.

## Notes for developers

* This is a simple [JAMstack](https://jamstack.org/) project, consisting only of vanilla javascript (no frameworks)

* The *html*, *css*, and *javascript* files in this project require no build scripts.  Source files can be edited and re-deployed with modifications.

* Optional: *Css* developers have an alternative to working with the css code directly. If you're familiar with [Sass](https://sass-lang.com/) (which we use for convenience in developing our css), you can work with the *scss* source files provided (in the *scss* folder).
	
* Files you can ignore:
	* I keep a *Gruntfile.js* file in this repo for preservation.  This is a file that I use to automate some tasks in my own environment.  It is beyond the scope of understanding how this application works.  Feel free to ignore it!
	* Source *scss* files in the *scss* folder, if you're not using Sass.
