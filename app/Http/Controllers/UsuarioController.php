<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class UsuarioController extends Controller
{
    public function __construct()
    {
        $this->middleware('guest')->except('logout');
    }

    /**
     * Muestra el formulario de inicio de sesión
     *
     * @return \Illuminate\View\View
     */
    function showLoginForm(){
        return view('prototipos.usuario.login');
    }

    /**
     * Maneja el inicio de sesión del usuario
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    function login(Request $request){

        $request->validate([
           'email'=>'required|email',
           'password'=>'required|min:8|max:30'
        ],[
            'email.exists'=>'This email is not exists in admins table'
        ]);
        $creds = $request->only('email','password');
        
        if( Auth::attempt($creds) ){            
            return redirect()->route('reunion');               
        }else{
            return redirect()->route('login')->with('fail','Incorrect credentials');
        }
       
    }

    /**
     * Muestra el formulario de registro
     *
     * @return \Illuminate\View\View
     */
    function showRegistrationForm(){
        return view('prototipos.usuario.register');
    }

    /**
     * Maneja el registro del usuario
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    function register(Request $request){
        $request->validate([
            'name'=>'required',
            'email'=>'required|email|unique:usuario',
            'password'=>'required|min:8|max:30',
         ],[
             'name.required'=>'ingrese nombre',             
             'email.required'=>'ingrese correo electronico',
             'email.exists'=>'This email is not exists in admins table',
             'password.required'=>'ingrese contraseña',
         ]);


        $usuario = Usuario::create([
            'name' => $request['name'],
            'email' => $request['email'],
            'password' => Hash::make($request['password']),
        ]);        
        Auth::login($usuario);
        return redirect()->route('reunion');
    }

    
    /**
     * Sale del usuario
     *
     * @return \Illuminate\View\View
     */
    function logout(){
        Auth::logout();
        return redirect('/');
    }
}
