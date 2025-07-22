<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Usuario</title>
    
    <link rel="stylesheet" href=" {{ asset('css/style_user.css') }} ">   

</head>
<body>
    
    <div class="container">
        <div class="form-container">
            <div class="login-form">
                <h2>Login</h2>
                <form id="formulario" action="{{ route('login') }}" method="post">                
                    @csrf
                    <input type="email" name="email" placeholder="Email" value="juanperez@gmail.com" required>
                    <div class="input-group">
                        <input type="password" name="password" id="password" placeholder="Password" value="holamundo"  required>
                        <button type="button" class="toggle-password" onclick="togglePassword()">👁️</button>
                    </div>
                    <button id="loginBtn" type="submit">Login</button>

                    <p>Don't have an account? <a href="{{ route('register') }}" id="goToRegister">Register</a></p>
                    <div id="loginMessage" class="message"></div>
                </form>
            </div>
        </div>
    </div>

    <script>
        function togglePassword() {
            const passwordInput = document.getElementById("password");
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
            } else {
                passwordInput.type = "password";
            }
        }

        document.getElementById('formulario').addEventListener('submit', function () {
            document.getElementById('loginBtn').disabled = true;
        });


        
    </script>
    
</body>
</html>