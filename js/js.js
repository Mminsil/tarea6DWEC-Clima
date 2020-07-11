//https://www.weatherbit.io/api
var apyKey = '1549260546b046b8b747d28861e9208f';
var ciudad;

$(document).ready(function() {
    //Cargamos al body una imagen de fondo
    $('body').css({ 'background-image': 'url(img/fondo.jpg)', 'background-repeat': 'no-repeat', 'background-size': 'cover' });
    $('.cabecera').css('cursor', 'pointer');

    //Cuando se hace clic en la cabecera se limpian los div de información y se carga la imagen de fondo de la página principal
    $('.cabecera').click(function() {
        limpiar();
        $('body').css({ 'background-image': 'url(img/fondo.jpg)', 'background-repeat': 'no-repeat', 'background-size': 'cover' });
    });

    //Ponemos al foot un fondo negro con opacidad
    $('.foot').css({ 'backgroundColor': 'black', 'opacity': '0.7' });

    /*************************CLIMA**********************/

    //Clic sobre el botón Clima
    $('#clima').click(function(event) {
        //Se limpian los div de información
        limpiar();
        //Cargamos una imagen diferente de fondo
        $('body').css({ 'background-image': 'url(img/clima.jpg)', 'background-repeat': 'no-repeat', 'background-size': 'cover' });

        $('button').removeClass();
        $('button').addClass('btn btn-outline-info');

        //Quitamos el evento por defecto para que no se recargue la página la pulsar el botón
        event.preventDefault();

        ciudad = validarCiudad($('#ciudad').val());

        //Creamos la url para enviar en la petición
        //Si queremos que busque en España le podemos poner a la dirección &country=es antes de apyKey
        let url = 'https://api.weatherbit.io/v2.0/current?city=' + ciudad + '&key=' + apyKey + '&lang=es&units=M';

        //Realizamos la petición
        $.get(url, function(data, estado) {

            if (estado == 'success') {
                //Variables con los datos a enseñar
                let a = data['data'][0];
                let temp = a.temp;
                let wind_spd = a.wind_spd;
                let wind_dir = a.wind_cdir_full;
                let precip = a.precip;
                let icono = a['weather'].icon;
                let press = a.pres;
                let descr = a['weather'].description;
                let r = $('#resultado');

                //Clases bootstrap4
                $('#wrap').addClass('border border-info text-info h4 p-3 text-center');
                $('#wrap').css({ 'backgroundColor': 'white', 'opacity': '0.7' });

                //Quitamos el atributo al botón Prediciones
                $('#predicciones').removeAttr('hidden');

                //Cargamos el icono con la imagen de la API 
                let i = new Image();
                //Creamos la url
                let src = 'https://www.weatherbit.io/static/img/icons/' + icono + '.png';
                i.src = src;
                i.alt = "icono clima";
                $('#img').append(i);

                //Cargamos los datos que nos devuelve la API en la zona de información
                r.append('Clima en ' + ciudad + ': ' + descr + '<br/><br/>');
                r.append('Temperatura: ' + temp + 'ºC<br/>');
                //Si hay viento ponemos la información
                if (wind_spd > 0) {
                    r.append('Velocidad del viento: ' + wind_spd + 'km/s ' + wind_dir + '.');
                }
                r.append('<br/>Presión atmosférica: ' + press + ' mb');
                r.append('<br/>Precipitaciones: ' + precip + '%.<br/><br/>');

            } else {
                error();
            }
        }, 'json');


    }); //CLIMA    

    /*************************POLUCIÓN**********************/

    //Clic sobre el botón Polución
    $('#polucion').click(function(event) {
        //Se limpian los div de información
        limpiar();

        $('button').removeClass();
        $('button').addClass('btn btn-outline-light');

        //Cargamos una imagen diferente de fondo
        $('body').css({ 'background-image': 'url(img/conta.jpg)', 'background-repeat': 'no-repeat', 'background-size': 'cover' });

        //Quitamos el evento por defecto para que no se recargue la página la pulsar el botón
        event.preventDefault();

        ciudad = validarCiudad($('#ciudad').val());

        //Creamos la url
        let url = 'https://api.weatherbit.io/v2.0/current/airquality?city=' + ciudad + '&key=' + apyKey;

        $.get(url, function(data, estado) {
            if (estado == 'success') {
                //Variables con los datos a enseñar
                var a = data['data'][0];
                let o3 = a.o3;
                let aqi = a.aqi;
                let so2 = a.so2;
                let no2 = a.no2;
                let pm10 = a.pm10;

                let r = $('#resultado');

                //Clases bootstrap4
                $('#wrap').addClass('border border-info text-info h4 p-3 text-center');
                $('#wrap').css({ 'backgroundColor': 'white', 'opacity': '0.8' });

                //Cargamos el icono con la imagen de la API 
                let i = new Image();
                let src = 'img/4.png';
                i.src = src;
                i.alt = "icono polucion";
                $('#img').append(i);

                //Cargamos los datos que nos devuelve la API en la zona de información
                r.append('Hoy en ' + ciudad + ' tenemos: <br/><br/>');
                r.append('Ozono: ' + o3 + ' µg/m³.<br/>Calidad del aire: ' + aqi + ' µg/m³.<br/>Dióxido de azufre: ' + so2 + ' µg/m³.<br/>');
                r.append('Dióxido de nitrógeno ' + no2 + ' µg/m³.<br/>Partículas: ' + pm10 + ' µg/m³.<br/><br/>');
            } else { //Si el servidor no devuelve lo que esperamos, entiendo que la ciudad no es correcta
                error();
            }
        }, 'json');

    }); //POLUCIÓN  


    /*************************PREDICCIÓN**********************/
    $('#predicciones').click(function(event) {
        limpiar();
        //Quitamos el evento por defecto para que no se recargue la página la pulsar el botón
        event.preventDefault();

        $('#resultado').append('La temperatura en ' + ciudad + ' en los próximos días: <br/>');
        prediccion(3);
        prediccion(6);
        prediccion(8);
        prediccion(15);


    });

    $('#ciudad').click(function() {
        $('#ciudad').val('');
    });


}); //READY



/**
 * Función que limpia los div a utilizar de otras posibles consultas
 */
function limpiar() {
    $('#resultado').empty();
    $('#img').empty();
    $('#error').empty();
    $('#predicciones').attr('hidden', true);
}



/**
 * Función que comprueba que el input con id ciudad no esté vacío. Si lo está muestra un error en pantalla.
 * Si no lo está, cambia la primera letra de cada palabra que compone el nombre de la ciudad a mayúsculas.
 * @param {string} ciudadEnviada 
 */
function validarCiudad(ciudadEnviada) {
    if (ciudadEnviada == '') {
        error();
    } else {
        $('#error').empty();
        //Pillamos el valor del input y convertimos la primera letra a mayúsculas
        let ciudad = capitalize(ciudadEnviada);
        return ciudad;
    }
}



/**
 * Función que cambia a mayúscula la primera letra de cada palabra
 * @param {string} string 
 */
function capitalize(string) {
    let str = string.split(' ');
    let ciudad = '';

    str.forEach(element => {
        ciudad += element.charAt(0).toUpperCase() + element.slice(1) + ' ';
    });

    return ciudad;
}



/**
 * Función que muestra un error en pantalla cuando el usuario no introduce una ciudad o la ciudad no es correcta.
 */
function error() {
    $('#error').css('color', 'red');
    $('#error').addClass('h5 mt-3');
    $('#error').html('Debe introducir una ciudad para ver los resultados.');
}

/**
 * Función a la que le mandamos un número (días por delante) y nos devuelve la predicción sumándole ese número
 */
function prediccion(num) {
    //Creamos la url
    let url1 = 'https://api.weatherbit.io/v2.0/forecast/daily?city=' + ciudad + '&key=' + apyKey + '&lang=es&units=M&days=' + num;

    let a;
    $.get(url1, function(data, estado) {
        if (estado == 'success') {
            //Variables con los datos a enseñar
            a = data['data'][0];
            let r = $('#resultado');
            r.append(num + ' días: ' + a.temp + ' ºC<br/>');
            //console.log(a);
        }
    }, 'json');
    return a;
}