var gulp = require('gulp');
    rename = require('gulp-rename'),
    babel = require('gulp-babel');

gulp.task('react', function () {
    return gulp.src(['ClientResources/**/*.jsx'], { base: './' })
        .pipe(babel({
            presets: [
                //["es2015", { "modules": "amd"}],
                ["react"]
            ],
            "plugins": [
                "babel-plugin-transform-es2015-template-literals",
                "babel-plugin-transform-es2015-literals",
                "babel-plugin-transform-es2015-function-name",
                "babel-plugin-transform-es2015-arrow-functions",
                "babel-plugin-transform-es2015-block-scoped-functions",
                "babel-plugin-transform-es2015-classes",
                "babel-plugin-transform-es2015-object-super",
                "babel-plugin-transform-es2015-shorthand-properties",
                "babel-plugin-transform-es2015-duplicate-keys",
                "babel-plugin-transform-es2015-computed-properties",
                "babel-plugin-transform-es2015-for-of",
                "babel-plugin-transform-es2015-sticky-regex",
                "babel-plugin-transform-es2015-unicode-regex",
                "babel-plugin-check-es2015-constants",
                "babel-plugin-transform-es2015-spread",
                "babel-plugin-transform-es2015-parameters",
                "babel-plugin-transform-es2015-destructuring",
                "babel-plugin-transform-es2015-block-scoping",
                "babel-plugin-transform-es2015-typeof-symbol",
                "add-module-exports",
                ["babel-plugin-transform-es2015-modules-amd", {strict: false}],
                "babel-plugin-transform-regenerator"
            ]
        }))
        .pipe(rename(function(path) {
            extname: ".js"
        }))
        .pipe(gulp.dest('./'));
});

gulp.task('watch', function () {
    gulp.watch(['ClientResources/**/*.jsx'], ['react']);
});

gulp.task('default', ['react']);