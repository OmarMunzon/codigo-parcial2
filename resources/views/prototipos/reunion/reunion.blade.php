<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Collaboration</title>
    <link rel="stylesheet" href="{{ asset('css/style_reunion.css') }}">    

</head>

<body>
    <div class="logout-container">
        <form id="logout-form" action="{{ route('logout') }}" method="POST" class="d-none">
            @csrf 
            <button id="logoutBtn">Logout ({{ Auth::user()->name }})</button>
        </form>
    </div>
    <div class="container">
        <h1>Iniciar una nueva Colaboracion</h1>
        <a id="createBtn" class="boton" href="{{ route('reunion.create') }}">Crear Colaboracion</a>
        

        <form id="formulario" action="{{ route('reunion.join') }}" method="post">
            @csrf
            <h1>Unirse a una Colaboracion</h1>            
            <input type="text" id="collaborationId" name="collaborationId" placeholder="pegar aqui link">
            <button type="submit" id="joinBtn">union Colaborativa</button>            
        </form>        
        
    </div>

    <script>
        document.getElementById('createBtn').addEventListener('click', function (e) {
            this.style.pointerEvents = 'none'; // No permite más clics
            this.style.opacity = 0.5;          // Efecto visual opcional
        });
        document.getElementById('formulario').addEventListener('submit', function (e) {
            console.log('joint collab')            
            this.style.pointerEvents = 'none'; // No permite más clics
            this.style.opacity = 0.5;          // Efecto visual opcional
        });
    </script>
    
</body>

</html>