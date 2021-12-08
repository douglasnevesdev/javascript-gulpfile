var gulp = require('gulp'),
  imagemin = require('gulp-imagemin'),
  clean = require('gulp-clean')
uglify = require('gulp-uglify'),
  usemin = require('gulp-usemin'),
  cssmin = require('gulp-cssmin'),
  browserSync = require('browser-sync').create(),
  jshint = require('gulp-jshint'),
  csslint = require('gulp-csslint'),
  autoprefixer = require('gulp-autoprefixer'),
  sass = require('gulp-sass'),
  runSequence = require('run-sequence');



/**
 * 1) Exclui as pastas public/css, public/img, public/fonts e public/js -> (exclui-pasta-public)
 * 2) Criar as pastas necessarias dentro da pasta public (criar-diretorios)
 * 
 * 3) Copia o jquery.min.js para public/js (copia-jquery-original)
 * 4) Copia o popper.min.js para public/js (copia-popper-original)
 * 5) Copia o bootstrap.min.js para public/js (copia-bootstrap-js-original)
 * 
 * 6) Copia os arquivos do .scss do bootstrap para resources/scss (copia-bootstrap-scss-original)
 * 7) Compilação do Bootstrap para pasta public/css. (compila-arquivos-scss)
 * 
 * 8) Executa tarefas sobre anotações no html, afetando os arquivos com anotação, no caso js e css de acordo com a ordem (substitui-css-js-html)
 * 
 * 9) Otimiza todas as imagens do diretorio dist. (otimiza-imagens-pasta-dist)
 * 
 * 10) Executa um servidor web, atualizando de acordo com mudanças feitas nos arquivos da pasta src, tambem tem 2 tarefas que monitora erros de sintaxe no javascript e css mostrando no console. (server)
 */



/**
* Tarefa Principal executa -> 1, 2, 3, 4, 5, 6, 9
*/
gulp.task('default', ['criar-diretorios'], function () {
  //O start() executa as tarefas em paralelo.
  gulp.start('copia-jquery-original', 'copia-popper-original', 'copia-bootstrap-js-original', 'copia-bootstrap-scss-original', 'otimiza-imagens-pasta-dist');
  //O runSequence() executa as tarefas em sequencia.
  runSequence('compila-arquivos-scss', 'substitui-css-js-html');
});


//1 - Excluir todo o conteudo da pasta dist.
gulp.task('exclui-pasta-public', function () {
  return gulp.src(['public/css', 'public/img', 'public/fonts', 'public/js'])
    .pipe(clean());
});


//2 - Criar as pastas necessarias dentro da pasta dist
gulp.task('criar-diretorios', ['exclui-pasta-public'], function () {
  return gulp.src('*.*', { read: false })
    .pipe(gulp.dest('public/css'))
    .pipe(gulp.dest('public/img'))
    .pipe(gulp.dest('public/fonts'))
    .pipe(gulp.dest('public/js'));
});


// 3 - Copia o arquivo node_modules/jquery/dist/jquery.js para a pasta src/js e dist/js
gulp.task('copia-jquery-original', function () {
  return gulp.src('node_modules/jquery/dist/jquery.min.js')
    .pipe(gulp.dest('public/js'));
});



// 4 - Copia o arquivo node_modules/popper.js/dist/umd/popper.js para pasta src/js e dist/js
gulp.task('copia-popper-original', function () {
  return gulp.src('node_modules/popper.js/dist/umd/popper.min.js')
    .pipe(gulp.dest('public/js'));
});


// 5 - Copia os arquivos node_modules/bootstrap em sass para a pasta src/scss.
gulp.task('copia-bootstrap-scss-original', function () {
  return gulp.src('node_modules/bootstrap/scss/**/*')
    .pipe(gulp.dest('resources/scss'));
});


// 6 - Compila arquivos da pasta src/scss para a pasta dist/css, de sass para css.
gulp.task('compila-arquivos-scss', function () {

  return gulp.src('resources/scss/**/*.scss') //Obtem os arquivos scss

    .pipe(sass({ errLogToConsole: true }))

    .on('error', catchErr)

    // converter o sass em css.
    .pipe(gulp.dest('public/css'))

    .pipe(browserSync.stream());

});

function catchErr(e) {
  console.log(e);
  this.emit('end');
}

// 7 - Otimiza todas as imagens do diretorio dist.
gulp.task('otimiza-imagens-pasta-dist', function () {
  return gulp.src('public/img/**/*')
    .pipe(imagemin())
    .pipe(gulp.dest('public/img'));
});

// 8 - Executa tarefas sobre anotações no html, afetando os arquivos com anotação, no caso js e css de acordo com a ordem.
gulp.task('substitui-css-js-html', function () {
  return gulp.src('resources/views/**/*.php')
    .pipe(usemin({
      js: [uglify],
      css: [autoprefixer, cssmin]
    }))
    .pipe(gulp.dest('resources/views'));
});




//10 - Executa um servidor web, atualizando de acordo com mudanças feitas nos arquivos da pasta src, tambem tem 2 tarefas que monitora erros de sintaxe no javascript e css mostrando no console.
gulp.task('server', function () {

  //Executa o servidor junto ao xampp.
  browserSync.init({
    proxy: "http://localhost:8000/hotsite/public/"
  });

  //Recarrega e sincroniza navegador.
  gulp.watch('public/**/*').on('change', browserSync.reload);
  gulp.watch('resources/views/**/*').on('change', browserSync.reload);

  //Verifica se foi modificado arquivos .scss e compila para pasta .css
  gulp.watch('resources/scss/**/*.scss').on('change', function (event) {
    runSequence('compila-arquivos-scss');
  });

  //Verifica a sintaxe dos arquivos .css da pasta dist (OPCIONAL)
  /*
  gulp.watch('dist/css/style.css').on('change', function(event){
    gulp.src(event.path)
    .pipe(csslint())
    .pipe(csslint.formatter());
  });
  */


  /*
  //Verifica se tem erros de sintaxe .js (OPCIONAL)
  gulp.watch('src/js/*.js').on('change', function(event){
    gulp.src(event.path)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
  }); 
  */


});

// 11 - Copia o arquivo node_modules/bootstrap/dist/js/bootstrap.min.js para pasta dist/js
gulp.task('copia-bootstrap-js-original', function () {
  return gulp.src('node_modules/bootstrap/dist/js/bootstrap.min.js')
    .pipe(gulp.dest('public/js'));
});






