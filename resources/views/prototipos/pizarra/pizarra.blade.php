<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pizarra</title>

    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">        
    <!-- cdns -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jointjs/3.5.4/joint.min.css" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>
    
    <link rel="stylesheet" href="{{ asset('css/style_pizarra.css') }}">
</head>
<body>
    <div id="container">
        <div id="top-menu">         
            <button onclick="document.getElementById('miDialogo').showModal()">CopyLink</button>
            <dialog id="miDialogo">
                <p id="dialogText">{{ $urlCompleta }}</p>
                <button id="copyBtn">Copiar Texto</button>
                <button onclick="document.getElementById('miDialogo').close()">Cerrar</button>
                <div id="toast">¡Texto copiado al portapapeles!</div>
            </dialog>            
            
            <button id="openBtn">Abrir</button>                        
            <input type="file" id="openFile" accept=".json">

            <button id="saveAsBtn">Guardar Como</button>            
            
            <input type="file" id="boceto" style="display: none;" accept="image/*">
            <button type="button" onclick="document.getElementById('boceto').click()">Importar Boceto</button>

            <button id="btn-generar-cod-movil">Generar Codigo Flutter</button>

            <a href="{{ route('reunion.finalizar') }}" class="btn-finalizar" id="btn-finalizar-reunion">Finalizar Collaboracion</a>
        </div>

        <div id="main-content">
            <div class="sidebar" id="left-sidebar">
                <h2>Componentes</h2>                
                <div class="palette-item" draggable="true" data-type="page">Phone</div>
                <div class="palette-item" draggable="true" data-type="appbar">Appbar</div>
                <div class="palette-item" draggable="true" data-type="button">Button</div>
                <div class="palette-item" draggable="true" data-type="input">Input</div>
                <div class="palette-item" draggable="true" data-type="label">Text</div>
                <div class="palette-item" draggable="true" data-type="checkbox">Checkbox</div>
                <div class="palette-item" draggable="true" data-type="radio">Radio Button</div>                
            </div>

            <div class="lienzo">
                <div id="paper"></div>
            </div>

            <div class="sidebar" id="right-sidebar">
                <h2>Propiedades</h2>                 

                <div class="form-group">
                    <label class="form-label">Width</label>
                    <input id="width" type="number" class="width-input">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Height</label>
                    <input id="height" type="number" class="height-input">
                </div>

                <div class="controls">                                        
                    <button id="delete-button" class="control-button">Eliminar Componente</button>
                    <button id="btn-clear">ClearLienzo</button>
                </div>                
                <input type="text" id="nameComponent" name="labelText" disabled>   
                <label for="newName">New Name:</label> 
                <input type="text" id="newName">
                <button id="saveName">Save Name</button>                                
            </div>
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.4.0/backbone-min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jointjs/3.5.4/joint.min.js"></script>

    <script src="{{ asset('js/app.js') }}"></script>

    <script src="{{ asset('js/script_pizarra.js') }}"></script>

    <script>
    // Lógica para abrir el diálogo
    document.getElementById('btn-audio-texto').onclick = function() {
        document.getElementById('dialog-audio-texto').showModal();
    };
    </script>

</body>

</html>