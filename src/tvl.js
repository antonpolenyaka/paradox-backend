function getTVL() {
    // Mostramos un par de mensajes con 'console.log()'. Puedes reemplazar el código con una determinada tarea que desees que se ejecute 
    /*
    console.log("⌚⌚⌚⌚⌚");
    console.log("Ejecutando una tarea cada 5 segundos");  
    */

    // Formateamos y Mostramos la Fecha Actual 
    function mostrarFecha(verFecha) {

        let fecha, mes, anio;

        fecha = verFecha.getDate();
        mes = verFecha.getMonth() + 1;
        anio = verFecha.getFullYear();

        fecha = fecha
            .toString()
            .padStart(2, '0');

        mes = mes
            .toString()
            .padStart(2, '0');

        return `${fecha}-${mes}-${anio}`;
    }

    const resultado = mostrarFecha(new Date());

    console.log(resultado);
}

function updateTVL() {
    
    
}

function processTVL() {
    getTVL();
    updateTVL();
}

module.exports = { processTVL };