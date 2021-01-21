console.info("Main.js cargado con éxito.");

document.getElementById('formTurnos').addEventListener('submit', nuevoTurno);

//Función para agregar un nuevo turno
function nuevoTurno(e){
    console.log("Se apretó para agregar un nuevo turno.");
    const { value: formValues } =  Swal.fire({
        title: 'Nuevo turno',
        html:
            '<input id="nombre_cliente" class="validate" placeholder="Cliente" required>' +
            '<label for="nombre_cliente">Cliente</label>' +
            '<textarea id="descripcion" class="materialize-textarea" placeholder="Descripción"></textarea>' +
            '<label for="descripcion">Descripción</label>' +
            '<input id="fecha" type="date" class="datepicker"  >'+
            '<label for="fecha">Fecha</label>' +
            '<input id="hora" type="time" class="datepicker" value="16:00">' +
            '<label for="hora">Hora</label>' ,
        focusConfirm: false,
        preConfirm: () => {
            let fecha =document.getElementById('fecha').value;
            let hora = document.getElementById('hora').value;
            let exists = false; 

            //Acá busca si existe algun turno ya guardado con esa fecha y hora. Si existe pone la variable "exists" en true y no deja guardar el turno.
            if(localStorage.getItem("turnos")!= null){
                let turnos = JSON.parse(localStorage.getItem("turnos"));
                for(let i = 0; i < turnos.length; i++){
                    if(turnos[i].fecha == fecha && turnos[i].hora == hora){
                        exists = true;
                    }
                }
            }
            if(exists == false){
                if(document.getElementById('nombre_cliente').value != "" && document.getElementById('descripcion').value != "" &&
                    document.getElementById('fecha').value != "" &&
                        document.getElementById('hora').value != ""){
                    guardarTurno(document.getElementById('nombre_cliente').value, document.getElementById('descripcion').value,
                        document.getElementById('fecha').value, document.getElementById('hora').value);
                }else if(document.getElementById('nombre_cliente').value != "" && document.getElementById('descripcion').value == "" &&
                            document.getElementById('fecha').value != "" &&
                                document.getElementById('hora').value != ""){
                        guardarTurno(document.getElementById('nombre_cliente').value, "Sin descripción",
                        document.getElementById('fecha').value, document.getElementById('hora').value);
                }else{
                    nuevoTurno();
                }
            }else{
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Ese turno ya existe.',
                });
            }
        }
    })
    e.preventDefault(); //Evitar refresco de página.
}
function guardarTurno(cliente,descripcion,fecha,hora){
    //Si el ID no está guardado se le asigna un 0.
    if(localStorage.getItem("id") === null){
        let id = 0;
        localStorage.setItem("id", id);
    }

    //objeto turno con id, cliente, desc, fecha y hora
    const turno = {
        id: localStorage.getItem("id"), 
        cliente,
        descripcion,
        fecha,
        hora
    };

    //si todavia no se guardó ningún turno entonces arma un array de turnos, lo actualiza y guarda en formato string
    if(localStorage.getItem("turnos") === null){
        let turnos = [];
        localStorage.setItem("id", parseInt(localStorage.getItem("id"))+1);
        turnos.push(turno);
        localStorage.setItem("turnos", JSON.stringify(turnos));
    }else{ //si ya existen turnos guardados entonces los pasa a objetos a un array, agrega el nuevo turno y lo guarda como string
        let turnos = JSON.parse(localStorage.getItem("turnos"));
        localStorage.setItem("id", parseInt(localStorage.getItem("id"))+1);
        id = localStorage.getItem("id");
        turnos.push(turno);
        localStorage.setItem("turnos", JSON.stringify(turnos));
    }
    M.toast({
        html: 'Turno agregado.'
    });
    obtenerTurnos();
}

function eliminarTurno(id){
    Swal.fire({
        title: '¿Segura queres eliminar este turno?',
        showDenyButton: true,
        confirmButtonText: `Eliminar`,
        denyButtonText: `Cancelar`,
    }).then((result) => {
        if (result.isConfirmed) {
            let turnos = JSON.parse(localStorage.getItem("turnos"));
            for(let i = 0; i < turnos.length; i++){
                if(turnos[i].id == id){
                    turnos.splice(i,1);
                }
            }
            localStorage.setItem("turnos",JSON.stringify(turnos));
            M.toast({
                html: 'Turno eliminado.'
            });
            obtenerTurnos();
            }
        }
    )
}

function finalizarTurno(id){
    //Busca el turno en el localstorage por el id y una vez encontrado lo elimina
    let turnos = JSON.parse(localStorage.getItem("turnos"));
    for(let i = 0; i < turnos.length; i++){
        if(turnos[i].id == id){
            turnos.splice(i,1);
        }
    }
    localStorage.setItem("turnos",JSON.stringify(turnos));
    M.toast({
        html: 'Turno completado.',
    });
    obtenerTurnos();
}

function obtenerTurnos(){
    let turnos = JSON.parse(localStorage.getItem("turnos"));
    let verTurnos = document.getElementById('turnos');
    verTurnos.innerHTML = '';
    if(localStorage.getItem("turnos") == null || turnos.length == 0){
        verTurnos.innerHTML = 
        `
        <div class="card blue-grey darken-4">
            <div class="card-content white-text">
                <p>No tenés turnos pendientes.</p>
            </div>
        </div>
        `
    }

    //ORDENAR POR FECHA
    turnos.sort((a,b) => {
        let parte = a.fecha.split('-');
        let fa = new Date(parte[0], parte[1], parte[2]);
        parte = b.fecha.split('-');
        let fb = new Date(parte[0], parte[1], parte[2]);
        return fa-fb;
    });

    //ORDENAR POR HORA
    turnos.sort((a,b) => {
        let parte = a.fecha.split('-');
        let fa = new Date(parte[0], parte[1], parte[2]);
        let parte2 = b.fecha.split('-');
        let fb = new Date(parte2[0], parte2[1], parte2[2]);
        if(fa.getTime()==fb.getTime()){
            let ha = a.hora.split(':');
            let hb = b.hora.split(':');
            return ha[0]-hb[0];
        }
    });

    //ORDENAR POR MINUTOS
    turnos.sort((a,b) => {
        let parte = a.fecha.split('-');
        let fa = new Date(parte[0], parte[1], parte[2]);
        let parte2 = b.fecha.split('-');
        let fb = new Date(parte2[0], parte2[1], parte2[2]);
        let ha = a.hora.split(':');
        let hb = b.hora.split(':');
        if(ha[0]==hb[0] && fa.getTime() == fb.getTime()){
            return ha[1]-hb[1];
        }
    });

    //Una vez ordenado el array de turnos los muestra en pantalla en formato de cards con el nombre del dia y del mes.
    for(let i = 0; i < turnos.length; i++){
        let cliente = turnos[i].cliente;
        let descripcion = turnos[i].descripcion;
        let fecha = turnos[i].fecha;
        let hora = turnos[i].hora;
        let id = turnos[i].id;
        let parte = fecha.split('-');
        let ffecha = new Date(fecha);
        let numDia = parte[2];

        let dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
        let mes = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        verTurnos.innerHTML += 
        `
        <div class="card blue-grey darken-4">
            <div class="card-content white-text">
                <span class="card-title">${cliente}  <small>- ${dias[ffecha.getDay()+1]} ${numDia} de ${mes[ffecha.getMonth()]} a las ${hora} hs.</small></span>
                <p>${descripcion}</p>
            </div>
            <div class="card-action">
                <a href="#" onclick="finalizarTurno('${id}')" ><i class="small material-icons">check</i></a>
                <a href="#" onclick="eliminarTurno('${id}')"><i class="small material-icons">delete</i></a>
                
            </div>
        </div>
        `
    }
}

obtenerTurnos();
