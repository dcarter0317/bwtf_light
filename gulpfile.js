'use strict';

var gulp          =  require('gulp'),
    // util          =  require('gulp-util'),
    concat        =  require('gulp-concat'),
    uglify        =  require('gulp-uglify'),
    rename        =  require('gulp-rename'),
    sass          =  require('gulp-sass'),
    autoprefixer  =  require('gulp-autoprefixer'),
    maps          =  require('gulp-sourcemaps'),
    del           =  require('del'),
    plumber       =  require('gulp-plumber'),
    imagemin      =  require('gulp-imagemin'),
    spritesmith   =  require('gulp-spritesmith'),
    csso          =  require('gulp-csso'),
    buffer        =  require('vinyl-buffer'),
    merge         =  require('merge-stream'),
    sync          =  require('browser-sync').create(),
    reload        =  sync.reload;

// gulp.task("log", function(){
//    util.log('');
// });

gulp.task("concatScripts", function(){
 return gulp.src('js/main.js')
  	  .pipe(maps.init())
	    .pipe(concat('app.js'))
      .pipe(uglify())
	    .pipe(maps.write('./'))
      .pipe(sync.reload({stream:true}))
	    .pipe(gulp.dest('js'));
});

gulp.task("minifyScripts", ['concatScripts'], function(){
 return	gulp.src("js/app.js")
  	    .pipe(uglify())
  	    .pipe(rename('app-min.js'))
  	    .pipe(gulp.dest('dist/js'));
});

gulp.task("compressImgs", function(){
 return gulp.src('img/*')
         .pipe(imagemin())
         .pipe(gulp.dest('dist/img'));
});

gulp.task("sprite", function(){
  // Generate our spritesheet. add images to imgsprite folder the task will build the spritesheet
  var spriteData = gulp.src('imgspritesrc/*.png')  //TODO: FIX OUTPUT LOCATION
                   .pipe(spritesmith({
                      imgName: 'sprite.png',
                      cssName: 'sprite.css'
                  }));
 //Pipe image stream through image optimizer and onto disk
  var imgStream = spriteData.img
    //DEV: We must buffer our stream into a buffer for 'imagemin'
    .pipe(buffer())
    .pipe(imagemin())
    .pipe(gulp.dest('dist/img'));

//Pipe CSS Stream through CSS optimizer and onto disk
  var cssStream = spriteData.css
    .pipe(csso())
    .pipe(gulp.dest('dist/css'));


 //Return a merged stream to handle both 'end' events
  return merge(imgStream, cssStream);
});

gulp.task("complieSass", function(){
 return gulp.src("scss/style.scss")
        .pipe(plumber())
        .pipe(maps.init())
        .pipe(sass({
                "outputStyle": "compressed",
                "includePaths": ["scss"],
                "onError": sync.notify
              }))
        .pipe(autoprefixer({
           browsers: ['last 3 versions'],
           cascade: false
          }))
        .pipe(maps.write('./'))
        .pipe(sync.reload({stream:true}))
        .pipe(gulp.dest('css'));
 });

gulp.task("browserSync", function(){
    sync.init({
       server: {
         baseDir: './'
       }
    });
});

gulp.task("clean", function(){
    del(['dist', 'css/style.css*', 'js/app*.js*']);
});

gulp.task("watchFiles", function(){
   gulp.watch('scss/**/*.scss', ['complieSass']);
   gulp.watch('js/*.js', ['concatScripts']);
   gulp.watch('img/*', ['compressImgs']);
   gulp.watch('*.html', sync.reload);
});

gulp.task("build", ['concatScripts', 'minifyScripts', 'complieSass', 'watchFiles', 'browserSync'], function(){
	return gulp.src(['css/style.css','js/app.min.js', '*.html', 'img/**', 'fonts/**'], {base: './'})
	            .pipe(gulp.dest('dist'));
});

gulp.task("default", ['clean'], function() {
    gulp.start("build");
});
