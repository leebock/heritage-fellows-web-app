# heritage-fellows-web-app

This repo contains the application files for the [NEA National Heritage Fellows Map](https://storymaps.esri.com/stories/2017/heritage-fellows/).  It is a custom application, built as a Story Maps Labs effort in cooperation with the Smithsonian Center for Folklife and Cultural Heritage.  

## Deployment

The primary file types in this repo are **html**, **css**, and **javascript**.  To deploy, simply copy the folder to a web server directory.

## Notes for developers

* This is a simple [JAMstack]("https://jamstack.org/") project, consisting only of vanilla javascript (no frameworks)
* For *html* and *javascript*, there are no build scripts.  Source files are deployed as written.
* For *css*, we use [Sass](https://sass-lang.com/) to generate the production *css* from *scss* source files.  Use of Sass is _not_ a requirement to deploy the app nor is it a requirement to modify the css.  But if you already use Sass in your development, then you might want to work with our *scss* files.

	The two options, then, for modifying css are:

	* If you like, you may edit *main.css* directly.  Or...

	* Use the Sass preprocessor to compile into css.  There are many benefits to SCSS, not the least of which is readability.  But it *does* require a little config up front:

		1. Go to [this website](https://sass-lang.com/install) to learn how to install command line **Sass**.
		2. Once Sass is installed, to compile from *scss* to *css*:

			* Open a command window.
			* Navigate to the root directory of this project.
			* Type the following:

			```
			sass --watch scss\main.scss:css\main.css
			```

			This command creates a watch process that monitors the *main.scss* file.  Any time that file changes, the compiler should automatically compile your modifications into css.  Because the other **.scss* are linked into the *main.scss* file, changes to those dependencies will also trigger a compile.

* Files you can ignore:

	There are a few files which I keep in source control for preservation, but which may not be relevant to other folks.

	* I use Grunt to automate some of my development tasks (just lint and auto-reload).  So, these two files are included in my repo: 
		* *Gruntfile.js*: Defines my Grunt tasks.
		* *.jshintrc*: Defines jshint options.

		You're welcome to use these files, if you're familiar with Grunt.  Otherwise, feel free to ignore them!
