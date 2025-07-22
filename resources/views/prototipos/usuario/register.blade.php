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
            <div class="register-form">
                <h2>Register</h2>
                <form id="formulario" action="{{ route('register') }}" method="post">
                    @csrf
                    <input type="text" name="name" placeholder="Name" required>
                    <input type="email" name="email" placeholder="Email" required>                    
                    <div class="input-group">
                        <input type="password" name="password" id="password" placeholder="Password" required>
                        <button type="button" class="toggle-password" onclick="togglePassword()">👁️</button>
                    </div>
                    <button id="registerBtn" type="submit">Register</button>

                    <p>Already have an account? <a href="{{ route('login') }}" id="goToLogin">Login</a></p>
                    <div id="registerMessage" class="message"></div>
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
            document.getElementById('registerBtn').disabled = true;
        });
    </script>

</body>
</html>