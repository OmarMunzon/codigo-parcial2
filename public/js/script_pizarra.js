const namespace = joint.shapes;
const graph = new joint.dia.Graph({}, { cellNamespace: namespace });
const paper = new joint.dia.Paper({
    el: document.getElementById('paper'),
    model: graph,
    width:  2000,
    height: 2000,
    gridSize: 10,
    drawGrid: true,
    background: { color: '#444' },
    embeddingMode: true,
    validateEmbedding: function(childView, parentView) {
        return (parentView.model.get('modelType') === 'page');
    },
    cellViewNamespace: namespace
});
//----------------------------------------------------
let selectedElement = null;
let draggedType = null;

// Configurar eventos de arrastre desde la paleta
document.querySelectorAll('.palette-item').forEach(item => {
    item.addEventListener('dragstart', (e) => {
        draggedType = e.target.dataset.type;
        e.dataTransfer.setData('text/plain', draggedType); // Para compatibilidad
        console.log('COMPONENTE arrastrado desde la paleta');
    });
});
//---------------------------------------------------------
// Permitir soltar en el contenedor
const paperContainer = document.getElementById('paper');

paperContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
    console.log('arrastrar elemento')
});

paperContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    const x = e.offsetX ;
    const y = e.offsetY ;

    if (draggedType) {
        let element;

        switch (draggedType) {
            case 'button':
              element = new joint.shapes.standard.Rectangle();
              element.resize(100, 40);
              element.position(x, y);
              element.attr({
                body: { fill: '#9f9594', rx: 10, ry: 10 },
                label: { text: 'Button', fill: 'white' },
              });
              element.set('modelType', 'button');
              break;

            case 'input':
              element = new joint.shapes.standard.Rectangle();
              element.resize(120, 30);
              element.position(x, y);
              element.attr({
                body: { fill: '#f0f0f0', stroke: '#333' },
                label: { text: 'input', fill: '#333' },
              });
              element.set('modelType', 'input');
              break;

            case 'page'://phone
              element = new joint.shapes.standard.Rectangle();
              element.resize(400, 550);
              element.position(x, y);
              element.attr({
                body: {
                   fill: '#fff',
                  stroke: '#000000',
                  strokeWidth: 5,
                //   rx: 15,
                //   ry: 15,
                },
                label: {
                  text: '',
                  fill: '#333',
                  fontSize: 14,
                  fontWeight: 'bold',
                },
              });
              element.set('modelType', 'page');
              element.set('embeddable', true);
              break;

            case 'appbar':
              element = new joint.shapes.standard.Rectangle();
              element.resize(400, 70);
              element.position(x, y);
              element.attr({
                body: {
                  fill: '#e0e0e0',
                  stroke: '#333',
                  strokeWidth: 2,
                  rx: 5,
                  ry: 5,
                },
                label: {
                  text: 'Appbar',
                  fill: '#333',
                  fontSize: 14,
                  fontWeight: 'bold',
                },
              });
              element.set('modelType', 'appbar');
              break;

            case 'label':
              element = new joint.shapes.standard.Rectangle();
              element.resize(100, 30);
              element.position(x, y);
              element.attr({
                body: { fill: 'transparent', stroke: '#f9f9f9', strokeWidth: 1 },
                label: { text: 'text', fill: 'black', fontSize: 12 },
              });
              element.set('modelType', 'label');
              break;

            case 'checkbox':
              element = new joint.shapes.standard.Rectangle();
              element.resize(120, 30);
              element.position(x, y);
              element.attr({
                body: { fill: '#f0f0f0', stroke: '#000', strokeWidth: 1 },
                label: { text: '☐ Checkbox', fill: 'black', fontSize: 12 },
              });
              element.set('modelType', 'checkbox');
              break;

            case 'radio':
              element = new joint.shapes.standard.Rectangle();
              element.resize(120, 30);
              element.position(x, y);
              element.attr({
                body: { fill: '#fff', stroke: '#000', strokeWidth: 1 },
                label: { text: '◯ Radio Button', fill: 'black', fontSize: 12 },
              });
              element.set('modelType', 'radio');
              break;

            default:
        }

        if (element) {
            element.set('interactive', { resize: true, move: true });
            graph.addCell(element);
            console.log('Componente soltado en el lienzo en posición:', x,y);
            // Intentar incrustar en un contenedor si se suelta sobre uno
            const elementsBelow = graph.findModelsUnderElement(element);
            const parentContainer = elementsBelow.find(model => model.get('modelType') === 'page');

            if (parentContainer) {
                parentContainer.embed(element);
            }

            sendServer('/broadcast-component-dropped',element);

        }
    }

    draggedType = null;
});


//--------------------------------------------------------------------

// Listen events
window.Echo.channel('componente')
.listen('ComponentDropped', (e) => {
    const data = JSON.parse(e.data);
    if (!graph.getCell(data.id)) {
        const element = new joint.shapes.standard.Rectangle(data);
        element.set('interactive', { resize: true });
        graph.addCell(element);
        console.log('Component recibido del servidor en posición:', data.position);

        // Intentar incrustar en un contenedor si se suelta sobre uno
        const elementsBelow = graph.findModelsUnderElement(element);
        const parentContainer = elementsBelow.find(model => model.get('modelType') === 'page');
        if (parentContainer) {
            parentContainer.embed(element);
        }
    }

}).listen('ComponentMoved', (e) => {
    const data = JSON.parse(e.data);   
    const element = graph.getCell(data.id);    
    if (element) {                            
            element.set('position', data.position);
            console.log('Component movido por el servidor a posición:', data.position);        
    }else{
        console.log('ID de componente no encontrado');        
    }
}).listen('FinalizarReunion',(e)=>{
    if(e.estado === 'ok'){
        window.location.replace('http://localhost:8000/reunion');
    }
}).listen('ElementSelected',(e)=>{
    const data = JSON.parse(e.data);
    let comp = graph.getCell(data.selectedElement.id)
    if(comp){
        console.log('cambia el name de todos ')

        if (comp.get('modelType') === 'checkbox') {
            comp.attr('label/text', '☐ ' + data.inputValue);

        } else if(comp.get('modelType') === 'radio'){
            comp.attr('label/text', '◯ ' + data.inputValue);

        }else if(comp.get('modelType') === 'combobox'){
            comp.attr('label/text', data.inputValue + ' ▼');

        }else if(comp.get('modelType') === 'fecha'){
            comp.attr('label/text',data.inputValue + ' 📅');

        }else if(comp.get('modelType') !== 'content'){
            comp.attr('label/text', data.inputValue);
        }

        //fuerza un redibujado del elemento en el lienzo
        let rectView = comp.findView(paper);
        rectView.update();

    }

}).listen('ClearCanvas',(e)=>{
    const data = JSON.parse(e.elemento);

    if(Object.keys(data).length === 0){
        console.log('eliminia 1 solo elemento')
        graph.clear();
        selectedElement = null;
        document.getElementById('nameComponent').value = '';
    }else{
        console.log('elimina todos los elemento')
        let compt = graph.getCell(data.id)
        if(compt){
            compt.remove();
            compt = null;
            document.getElementById('nameComponent').value = '';
        }
    }
}).listen('CambiarColor',(e)=>{
    const data = JSON.parse(e.elemento);
    console.log('color');
    let compt = graph.getCell(data.selectedElement.id);
    if (compt) {
        compt.attr('body/fill', data.color);
    }
}).listen('ResizeElemento',(e)=>{
    const data = JSON.parse(e.elemento);
    console.log('resize elemento');
    let compt = graph.getCell(data.selectedElement.id);
    if (compt) {
        compt.resize(data.width,data.height);
    }
});
// .listen('ImportarImagen',(e)=>{         
//     e.data.detections.forEach(obj => {               
//         crearComponente(obj.label,30,30);
//     });
// });


//---------------------------------------------------------
// Selección de elementos
paper.on('element:pointerclick', function(cellView) {

    if (selectedElement) {
        selectedElement.attr('body/strokeWidth', 1); // Deseleccionar el anterior
        selectedElement.attr('body/stroke', '#000');        
    }

    selectedElement = cellView.model;
    selectedElement.attr('body/strokeWidth', 3); // Resaltar el seleccionado
    selectedElement.attr('body/stroke', 'red');
    
    document.getElementById('width').value = selectedElement.size().width;//tamaño de elemento
    document.getElementById('height').value = selectedElement.size().height;//tamaño de elemento

    //Nombre component
    if(selectedElement.get('modelType') !== 'content' || selectedElement.get('modelType') !== 'page'){
        document.getElementById("nameComponent").value = selectedElement.attr('label/text');
    }
    console.log('seleccionado '+ selectedElement.get('modelType'))
    console.log('ID: '+ selectedElement.get('id'))
});

// Deseleccionar al hacer clic en el lienzo
paper.on('blank:pointerclick', function() {
    console.log('deseleccionado all component')
    if (selectedElement) {
        selectedElement.attr('body/strokeWidth', 1);
        selectedElement.attr('body/stroke', '#000');
        selectedElement = null;
        document.getElementById("nameComponent").value = '';//limpiar input
        document.getElementById('width').value = '';
        document.getElementById('height').value = '';
    }
});

//---------------------------------------------------------

// soltar al mover un elemento
paper.on('element:pointerup', function(cellView) {    
    const element = cellView.model;        
    if (element.get('modelType') !== 'page') {
        const elementsBelow = graph.findModelsUnderElement(element);//Busca todos los modelos (element) que están debajo del elemento actual (elemento) en el gráfico.
        const parentContainer = elementsBelow.find(model => model.get('modelType')==='page');//Busca entre los elementos debajo (elementosBelow)
        if (parentContainer && !parentContainer.isEmbedded(element) ) {//insertar al content
            //Que el elemento (element) no esté ya incrustado (embedded) en el contenedor
            parentContainer.embed(element);
            console.log('agregado al contenedor')

        } else if (!parentContainer && element.getParentCell()) { // sacar de content
            //El elemento tiene un padre real (element.getParentCell() devuelve el contenedor padre, si existe).
            element.getParentCell().unembed(element);
        }
    }
    console.log('Componente soltado en posición final:', element.position());
    sendServer('/broadcast-component-moved',element);    
});

//---------------------------------------------------------
// Restringir la posición de elemento en el lienzo
graph.on('change:position', function(element, position) {
    const x = Math.max(0, Math.min(position.x, 2000));
    const y = Math.max(0, Math.min(position.y, 2000));

    if (x !== position.x || y !== position.y) {
        element.position(x, y);
    }
});

//---------------------------------------------------------
//---------------------------------------------------------



// Update tamaño del element
document.getElementById('width').addEventListener('input', (e) => {
    const size = selectedElement.size();
    let elemento = selectedElement;
    selectedElement.resize(Number(e.target.value), size.height);
    sendServer('/resize-elemento',{selectedElement: elemento, width: Number(e.target.value), height:size.height});
});
document.getElementById('height').addEventListener('input', (e) => {
    const size = selectedElement.size();
    let elemento = selectedElement;
    selectedElement.resize(size.width, Number(e.target.value));
    sendServer('/resize-elemento',{selectedElement: elemento, width:size.width ,height: Number(e.target.value)});
});



// Eliminar Componente
document.getElementById('delete-button').addEventListener('click', () => {
    if (selectedElement) {
        sendServer('/clear-canvas',selectedElement);
        selectedElement.remove();
        selectedElement = null;
        document.getElementById('nameComponent').value = '';
    }
});

//clear canvas
document.getElementById('btn-clear').addEventListener('click',()=>{
    graph.clear();
    selectedElement = null;
    document.getElementById('nameComponent').value = '';
    sendServer('/clear-canvas',{});
});


// Cambiar name de component
document.getElementById('saveName').addEventListener('click',(e)=>{
    if(selectedElement){
        let inputValue = document.getElementById('newName').value;

        if (selectedElement.get('modelType') === 'checkbox') {
            selectedElement.attr('label/text', '☐ ' + inputValue);

        } else if(selectedElement.get('modelType') === 'radio'){
            selectedElement.attr('label/text', '◯ ' + inputValue);

        }else if(selectedElement.get('modelType') === 'combobox'){
            selectedElement.attr('label/text', inputValue + ' ▼');

        }else if(selectedElement.get('modelType') === 'fecha'){
            selectedElement.attr('label/text',inputValue + ' 📅');

        }else if(selectedElement.get('modelType') !== 'content'){
            selectedElement.attr('label/text', inputValue);

        }

        sendServer('/element-name',{selectedElement:selectedElement,inputValue:inputValue});

        document.getElementById('nameComponent').value = inputValue;
        document.getElementById('newName').value = '';
    }
});


//--------------------
//copiar Link
const toast = document.getElementById('toast');
const dialogText = document.getElementById('dialogText');

 // Copiar texto al portapapeles
 document.getElementById('copyBtn').addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(dialogText.textContent);
        showToast();
    } catch (err) {
        console.error('Error al copiar el texto:', err);
        toast.textContent = 'Error al copiar el texto';
        toast.classList.add('error');
        showToast();
    }
});

// Mostrar notificación temporal
function showToast() {
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
        toast.classList.remove('error');
        toast.textContent = '¡Texto copiado al portapapeles!';
    }, 2000);
}
// ----------------------------------------------------------
//finalizarReunion
document.getElementById('btn-finalizar-reunion').addEventListener('click',()=>{
    sendServer('/broadcast-finalizar',{});
});

// ----------------------------------------------------------
// Enviar el evento al servidor
function sendServer(route,data){
    fetch(route, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
        },
        body: JSON.stringify( data )
    }).catch(error => console.error('Error:', error));
}
         
//---------------------------------------------------------------------------------
//importar boceto
document.getElementById('boceto').addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
        enviarBocetoServer("/detectar", file);        
    }
});

//enviar boceto al servidor
function enviarBocetoServer(route,file){
    const formData = new FormData();
    formData.append('image', file);   
    fetch(route, {    
        method: 'POST',
        headers: {  
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
        },
        body: formData,
    })
    .then(response => response.json())            
    .then(data => { 
        console.log('Image processed successfully:', data);                
        const objeto = data.respuesta.replace(/```json\n|```/g, '').trim();// Eliminar ```json y ``` del inicio y final      
        const myData = JSON.parse(objeto);        
        crearBoceto(myData);
    })
    .catch(error => { 
        console.error('Error processing image:', error);
    });
}

// Crear boceto a partir de los datos recibidos
function crearBoceto(data) {
    // Validar que los datos recibidos sean correctos
    if (!data || !data.components) {
      console.error('Datos inválidos');
      return;
    }
    
    // Recorrer los componentes y crear elementos en el lienzo    
    data.components.forEach(item => {
        let element;
        switch (item.type) {          
          case 'screen':
            element = new joint.shapes.standard.Rectangle();
            //element.resize(item.width, item.height);
            element.resize(400,550);
            element.position(item.x, item.y);
            element.attr({
              body: { fill: '#fff', stroke: '#333', strokeWidth: 2 },
              label: { text: '', fill: '#333' },
            });
            element.set('modelType', 'page');
            break;

          case 'appbar':          
            element = new joint.shapes.standard.TextBlock();
            element.resize(400, 70);
            element.position(item.x, item.y);
            element.attr({
              body: { fill: '#f0f0f0' },
              label: { text: item.text || '', fill: '#333' },
            });
            element.set('modelType', 'appbar');
            break;          

          case 'input':                  
            element = new joint.shapes.standard.Rectangle();
            element.resize(120, 30);
            element.position(item.x, item.y);
            element.attr({
              body: { fill: '#f0f0f0', stroke: '#333' },
              label: { text: '', fill: '#333' },
            });
            element.set('modelType', 'input');
            break;

          case 'button':
            element = new joint.shapes.standard.Rectangle();
            element.resize(100, 40);
            element.position(item.x, item.y);
            element.attr({
              body: { fill: '#9f9594', rx: 10, ry: 10 },
              label: { text: item.text || 'Button', fill: 'white' },
            });
            element.set('modelType', 'button');
            break;
          
          case 'label':
            element = new joint.shapes.standard.Rectangle();
            element.resize(100,30);
            element.position(item.x, item.y);
            element.attr({
              body: { fill: 'transparent', stroke: '#f9f9f9', strokeWidth: 1 },
              label: { text: item.text || 'Label', fill: 'black', fontSize: 12 },
            });
            element.set('modelType', 'label');
            break;
          
          case 'checkbox':
            element = new joint.shapes.standard.Rectangle();
            element.resize(120, 30);
            element.position(item.x, item.y);
            element.attr({
              body: { fill: '#f0f0f0', stroke: '#000', strokeWidth: 1 },
              label: { text: '☐ Checkbox', fill: 'black', fontSize: 12 },
            });
            element.set('modelType', 'checkbox');
            break;
          
          case 'radio':
            element = new joint.shapes.standard.Rectangle();
            element.resize(120, 30);
            element.position(item.x, item.y);
            element.attr({
              body: { fill: '#f0f0f0', stroke: '#000', strokeWidth: 1 },
              label: { text: '◯ Radio', fill: 'black', fontSize: 12 },
            });
            element.set('modelType', 'radio');
            break;
        }
    
        if (element) {
            element.set('interactive', { resize: true, move: true });
            graph.addCell(element);            
            // Intentar incrustar en un contenedor si se suelta sobre uno
            const elementsBelow = graph.findModelsUnderElement(element);
            const parentContainer = elementsBelow.find(model => model.get('modelType') === 'page');
    
            if (parentContainer) {
                parentContainer.embed(element);
            }       
            sendServer('/broadcast-component-dropped',element); 
        }

    });
    console.log('Boceto creado a partir de los datos recibidos');          
}

//----------------------------------------------------------
// -------------------------------------
guardarAbrir()
// Abrir y guardarComo
function guardarAbrir() {
    const openBtn = document.getElementById('openBtn');
    const openFile = document.getElementById('openFile');
    const saveAsBtn = document.getElementById('saveAsBtn');

    // Open: Load a JSON file
    openBtn.addEventListener('click', () => {
        openFile.click();
    });

    openFile.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
        try {
            const json = JSON.parse(e.target.result);
            json.cells = json.cells.map(cell => {
                //lo pasamos a rectangle estándar
                cell.type = 'standard.Rectangle';
                return cell;
            });

            graph.clear();
            graph.fromJSON(json);
            console.log('Graph loaded from file');
        } catch (err) {
            console.error('Failed to parse JSON:', err);
        }
        };
        reader.readAsText(file);
        openFile.value = ''; // Reset file input
    });

    // Save As: Download
    saveAsBtn.addEventListener('click', () => {
        const json = JSON.stringify(graph.toJSON(), null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const fileName = `graph_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);    
        
        fetch('/pizarra-guardar', {
            method: 'POST',
            headers: {     
                'Content-Type': 'application/json',           
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content            
            },        
            body: JSON.stringify( {nameFile:fileName} )
        })
        .then(response => response.json())
        .then(data => {
            if (data.status) {
                console.log('Datos guardados en la base de datos con éxito.');                
            } else {
                console.log('Error al guardar los datos: ');
            }
        })
        .catch(error => {
            console.error('Error:', error);          
        });
    });
}


//----------------------------------
//--------------------------------------------------------------
//generar codigo movil

let paginas = new Array();

function cargarPantallas() {
    const containers = graph.getElements().filter(el => el.get('modelType') === 'page');

    if (containers.length !== 0) {

        containers.forEach((container, index) => {
            const children = container.getEmbeddedCells();
            let componentMovil = new Array();
            children.forEach((child) => {
                const type = child.get("modelType");
                let comp = null;
                let typeModel = '';
                switch(type){
                    case 'appbar':
                        typeModel = 'appbar';
                        comp = `appBar:AppBar(title: const Text('${child.get('attrs').label.text}'),backgroundColor: Colors.grey,centerTitle: true)`;
                        break;

                    // case 'content':
                    //     typeModel = 'content';
                    //     comp = `Column(children: [])`;
                    //     break;

                    case 'button':
                        typeModel = 'button';
                        comp = `TextButton(
                            onPressed: (){},
                            style: TextButton.styleFrom(
                                foregroundColor: Colors.black, // Color del texto
                                backgroundColor: Colors.grey,  // Color de fondo
                            ),
                            child: const Text('${child.get('attrs').label.text}'),
                        )`;
                        break;

                    case 'input'://TextField
                        typeModel = 'input';
                        comp = `TextField(
                            controller: null,
                            decoration: InputDecoration(
                            labelText: '${child.get('attrs').label.text}',
                            border: OutlineInputBorder(),
                            ),
                        )`;
                        break;

                    case 'label'://Text
                        typeModel = 'label';
                        comp = `Text(
                            '${child.get('attrs').label.text}',
                            style: TextStyle(fontSize: 12),
                        )`;
                        break;

                    case 'checkbox':
                        typeModel = 'checkbox';
                        comp = `CheckboxListTile(
                            title: Text('${child.get('attrs').label.text}'),
                            value: false,
                            onChanged: (bool? value) {},
                        )`;
                        break;

                    case 'radio':
                        typeModel = 'radio';
                        comp = `RadioListTile<String>(
                            title: Text('${child.get('attrs').label.text}'),
                            value: 'opcion1',
                            groupValue: 'opcion2',
                            onChanged: (value) {},
                        )`;
                        break;

                    default:
                }
                componentMovil.push({typeModel: typeModel ,componente: comp});
            });
            paginas.push(componentMovil);
        });
        return true;
    }
    return false;
};


document.getElementById('btn-generar-cod-movil').addEventListener('click',async ()=>{
    if(cargarPantallas()){

        const zip = new JSZip();
        const projectFolder = zip.folder("flutter-project");
        // Define Flutter project structure
const flutterProjectStructure = {
  'my_flutter_app/pubspec.yaml': `
name: my_flutter_app
description: A new Flutter project.
version: 1.0.0+1
environment:
  sdk: '>=2.18.0 <3.0.0'
dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.8
dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0
flutter:
  uses-material-design: true
  `,
  'my_flutter_app/lib/main.dart': `
import 'package:flutter/material.dart';
import 'package:my_flutter_app/page1.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      home: const Page1(),
    );
  }
}
  `,  
  'my_flutter_app/android/app/build.gradle': `
plugins {
    id "com.android.application"
    id "kotlin-android"
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id "dev.flutter.flutter-gradle-plugin"
}

android {
    namespace = "com.example.my_flutter_app"
    compileSdk = flutter.compileSdkVersion
    ndkVersion = flutter.ndkVersion

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }

    kotlinOptions {
        jvmTarget = JavaVersion.VERSION_1_8
    }

    defaultConfig {
        // TODO: Specify your own unique Application ID (https://developer.android.com/studio/build/application-id.html).
        applicationId = "com.example.my_flutter_app"
        // You can update the following values to match your application needs.
        // For more information, see: https://flutter.dev/to/review-gradle-config.
        minSdk = flutter.minSdkVersion
        targetSdk = flutter.targetSdkVersion
        versionCode = flutter.versionCode
        versionName = flutter.versionName
    }

    buildTypes {
        release {
            // TODO: Add your own signing config for the release build.            
            signingConfig = signingConfigs.debug
        }
    }
}

flutter {
    source = "../.."
}
  `,
  'my_flutter_app/android/build.gradle': `
allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.buildDir = "../build"
subprojects {
    project.buildDir = "\${rootProject.buildDir}/\${project.name}"
}
subprojects {
    project.evaluationDependsOn(":app")
}

tasks.register("clean", Delete) {
    delete rootProject.buildDir
}
  `,
  'my_flutter_app/android/app/src/main/AndroidManifest.xml': `
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application
        android:label="my_flutter_app"
        android:name="\${applicationName}"
        android:icon="@mipmap/ic_launcher">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:taskAffinity=""
            android:theme="@style/LaunchTheme"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode"
            android:hardwareAccelerated="true"
            android:windowSoftInputMode="adjustResize">
            <!-- Specifies an Android theme to apply to this Activity as soon as
                 the Android process has started. This theme is visible to the user
                 while the Flutter UI initializes. After that, this theme continues
                 to determine the Window background behind the Flutter UI. -->
            <meta-data
              android:name="io.flutter.embedding.android.NormalTheme"
              android:resource="@style/NormalTheme"
              />
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>
        <!-- Don't delete the meta-data below.
             This is used by the Flutter tool to generate GeneratedPluginRegistrant.java -->
        <meta-data
            android:name="flutterEmbedding"
            android:value="2" />
    </application>
    <!-- Required to query activities that can process text, see:
         https://developer.android.com/training/package-visibility and
         https://developer.android.com/reference/android/content/Intent#ACTION_PROCESS_TEXT.

         In particular, this is used by the Flutter engine in io.flutter.plugin.text.ProcessTextPlugin. -->
    <queries>
        <intent>
            <action android:name="android.intent.action.PROCESS_TEXT"/>
            <data android:mimeType="text/plain"/>
        </intent>
    </queries>
</manifest>
  `,
  'my_flutter_app/ios/Runner/Info.plist': `
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>$(DEVELOPMENT_LANGUAGE)</string>
    <key>CFBundleExecutable</key>
    <string>$(EXECUTABLE_NAME)</string>
    <key>CFBundleIdentifier</key>
    <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
    <key>CFBundleName</key>
    <string>my_flutter_app</string>
    <key>CFBundleVersion</key>
    <string>1.0</string>
    <key>CFBundleShortVersionString</key>
    <string>$(FLUTTER_BUILD_NAME)</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleSignature</key>
    <string>????</string>
    <key>LSRequiresIPhoneOS</key>
    <true/>
    <key>UILaunchStoryboardName</key>
    <string>LaunchScreen</string>
    <key>UIRequiredDeviceCapabilities</key>
    <array>
        <string>arm64</string>
    </array>
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
    <key>UIViewControllerBasedStatusBarAppearance</key>
    <false/>
</dict>
</plist>
  `,
  'my_flutter_app/android/app/src/main/kotlin/com/example/my_flutter_app/MainActivity.kt': `
package com.example.my_flutter_app

import io.flutter.embedding.android.FlutterActivity

class MainActivity: FlutterActivity()
  ` ,

  'my_flutter_app/android/app/src/main/res/values/styles.xml': `<?xml version="1.0" encoding="utf-8"?>
<resources>    
    <style name="LaunchTheme" parent="@android:style/Theme.Light.NoTitleBar">        
        <item name="android:windowBackground">@drawable/launch_background</item>
    </style>    
    <style name="NormalTheme" parent="@android:style/Theme.Light.NoTitleBar">
        <item name="android:windowBackground">?android:colorBackground</item>
    </style>
</resources>
  `,
  'my_flutter_app/android/app/src/main/res/drawable/launch_background.xml': `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@android:color/white" />
    <item>
        <bitmap
            android:gravity="center"
            android:src="@mipmap/ic_launcher" />
    </item>
</layer-list>
  `,
  'my_flutter_app/android/settings.gradle':`
pluginManagement {
    def flutterSdkPath = {
        def properties = new Properties()
        file("local.properties").withInputStream { properties.load(it) }
        def flutterSdkPath = properties.getProperty("flutter.sdk")
        assert flutterSdkPath != null, "flutter.sdk not set in local.properties"
        return flutterSdkPath
    }()

    includeBuild("$flutterSdkPath/packages/flutter_tools/gradle")

    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

plugins {
    id "dev.flutter.flutter-plugin-loader" version "1.0.0"
    id "com.android.application" version "8.1.0" apply false
    id "org.jetbrains.kotlin.android" version "1.8.22" apply false
}

include ":app"
    `,
  'my_flutter_app/android/gradle.properties':`org.gradle.jvmargs=-Xmx4G -XX:MaxMetaspaceSize=2G -XX:+HeapDumpOnOutOfMemoryError
android.useAndroidX=true
android.enableJetifier=true`,
  'my_flutter_app/web/index.html':`
<!DOCTYPE html>
<html>
<head>  
  <base href="$FLUTTER_BASE_HREF">

  <meta charset="UTF-8">
  <meta content="IE=Edge" http-equiv="X-UA-Compatible">
  <meta name="description" content="A new Flutter project.">

  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black">
  <meta name="apple-mobile-web-app-title" content="my_flutter_app">
  
  <title>my_flutter_app</title>
  <link rel="manifest" href="manifest.json">
</head>
<body>
  <script src="flutter_bootstrap.js" async></script>
</body>
</html>
  `,
  'my_flutter_app/web/manifest.json':`
{
    "name": "my_flutter_app",
    "short_name": "my_flutter_app",
    "start_url": ".",
    "display": "standalone",
    "background_color": "#0175C2",
    "theme_color": "#0175C2",
    "description": "A new Flutter project.",
    "orientation": "portrait-primary",
    "prefer_related_applications": false    
}  
  `,  
  'my_flutter_app/README.md':`
# comandos flutter
# Desde la raíz de tu proyecto Flutter
flutter clean
flutter pub get
flutter doctor
flutter build apk --release
  `
};

        paginas.forEach((element,index) => {
            agregarRuta(flutterProjectStructure,`my_flutter_app/lib/page${index+1}.dart`,`
                import 'package:flutter/material.dart';

                class Page${index+1} extends StatefulWidget {
                    const Page${index+1}({super.key});

                    @override
                    State<Page${index+1}> createState() => _Page${index+1}State();
                }

                class _Page${index+1}State extends State<Page${index+1}> {
                    @override
                    Widget build(BuildContext context) {
                        return Scaffold(
                            body: Column(
                                children: [

                                ],
                            ),
                        );
                    }
                }
            `);
            element.forEach((componente) => {
                insertarCodigoRuta(flutterProjectStructure,componente,index);
            });
        });

        paginas.length = 0;

        //añadir imagen a una carpeta                
        const imageResponse = await fetch("../ic_launcher.png");
        const imageBlob = await imageResponse.blob();
                 
        flutterProjectStructure["my_flutter_app/android/app/src/main/res/mipmap-hdpi/ic_launcher.png"] = imageBlob;

        // Add files to the zip
        for (const [path, content] of Object.entries(flutterProjectStructure)) {
          projectFolder.file(path, content);
        }
        // Generate and download the zip file
        zip.generateAsync({ type: "blob" }).then(function (content) {
          saveAs(content, "flutter-project.zip");
        });
    }else{
        console.log('esta vacio el lienzo')
    }

});


//-------------------------------------------
function agregarRuta(objeto, ruta, contenido) {
  objeto[ruta] = contenido;
}

function insertarCodigoRuta(flutterProjectStructure,componente,index){
    Object.entries(flutterProjectStructure).forEach(([ruta, codigo]) => {

        if(ruta === `my_flutter_app/lib/page${index+1}.dart`){

            if( componente.typeModel === 'appbar'){
                const lineas = codigo.split('\n');
                const indiceCierre = lineas.findIndex(linea => linea.trim().startsWith('body:'));
                const nuevaLinea =  componente.componente+",";
                lineas.splice(indiceCierre, 0, nuevaLinea);
                flutterProjectStructure[ruta] = lineas.join('\n');

            }else{

                const lineas = codigo.split('\n');
                const indiceCierre = lineas.findIndex(linea => linea.trim().startsWith(']'));
                const nuevasLineas =  componente.componente+",";
                lineas.splice(indiceCierre, 0, nuevasLineas);
                flutterProjectStructure[ruta] = lineas.join('\n');
            }
        }
    });
}

//--------------------------------------------------------------

