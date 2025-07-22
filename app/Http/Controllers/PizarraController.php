<?php

namespace App\Http\Controllers;

use App\Events\CambiarColor;
use App\Events\ClearCanvas;
use App\Events\ComponentDropped;
use App\Events\ComponentMoved;
use App\Events\ElementSelected;
use App\Events\ResizeElemento;
use App\Models\Pizarra;
use App\Models\Reunion;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use PhpParser\Node\Stmt\TryCatch;

class PizarraController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Muestra la vista de la pizarra
     *
     * @return \Illuminate\View\View
     */
    function index()
    {
        $urlCompleta = request()->url();//ruta actual
        return view('prototipos.pizarra.pizarra',compact('urlCompleta'));
    }

    /**
     * Maneja el evento de arrastre de un botón en la pizarra
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function broadcastButtonDropped(Request $request)
    {
        $componenteData = $request->all();
        $componenteData = json_encode($componenteData);    
        broadcast(new ComponentDropped($componenteData))->toOthers();
        return response()->json(['status' => 'success']);
    }

    /**
     * Maneja el evento de movimiento de un botón en la pizarra
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function broadcastButtonMoved(Request $request)
    {
        $componenteData = $request->all();
        $componenteData = json_encode($componenteData);  
        broadcast(new ComponentMoved($componenteData))->toOthers();
        return response()->json(['status' => 'success']);
    }
    
    /**
     * Selecciona un elemento en la pizarra
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function selectElement(Request $request)
    {
        $data = $request->all();
        $data = json_encode($data);  
        broadcast(new ElementSelected($data))->toOthers();
        return response()->json(['status' => 'success']);
    }
    
    /**
     * Limpia el lienzo de la pizarra
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function clearCanvas(Request $request)
    {        
        $data = $request->all();
        $data = json_encode($data);  
        broadcast(new ClearCanvas($data))->toOthers();
        return response()->json(['status' => 'success']);
    }
    
    /**
     * Cambia el color de un elemento en la pizarra
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function cambiarColor(Request $request)
    {        
        $data = $request->all();
        $data = json_encode($data);  
        broadcast(new CambiarColor($data))->toOthers();
        return response()->json(['status' => 'success']);
    }
    
    /**
     * Redimensiona un elemento en la pizarra
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function resizeElemento(Request $request)
    {        
        $data = $request->all();
        $data = json_encode($data);  
        broadcast(new ResizeElemento($data))->toOthers();
        return response()->json(['status' => 'success']);
    }


    /**
     * Guarda el estado de la pizarra en la base de datos
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function guardar(Request $request){

        $data = $request->json()->all();
        $url = url()->previous();
        $reunion = Reunion::where('link',$url)->get();

        $pizarra = new Pizarra();
        $pizarra->namefile = $data['nameFile'];
        $pizarra->fecha = Carbon::now()->toDateString();
        $pizarra->id_reunion =$reunion[0]->id;
        //$pizarra->save();
        return response()->json(['status' => true]);
    }
    


    /**
     * Detecta objetos en una imagen usando la API de Gemini.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    //https://cloud.google.com/generative-ai/docs/gemini-2-flash

    public function detectarObjeto(Request $request)
    {
        // Validar si llegó la imagen
        if (!$request->hasFile('image') || !$request->file('image')->isValid()) {
            return response()->json(['error' => 'No se recibió una imagen válida'], 400);
        }

        // Obtener la imagen y codificarla a base64
        $image = $request->file('image');
        $imageData = base64_encode(file_get_contents($image->getRealPath()));
        $mimeType = $image->getMimeType(); // ej: 'image/png'

        // Construir payload
        $apiKey = env('GEMINI_API_KEY');
        
        $endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={$apiKey}";

        $payload = [
            'contents' => [
                [
                    'parts' => [                                                
                        ['text' => 'Analiza esta imagen de una interfaz de una app móvil y genera un JSON  con un array de components, que describa los componentes visuales detectados. Para cada componente, incluye tipo (screen, appbar, button, input, label, checkbox, radio) , (x, y), (width, height), texto si lo tiene, y una breve descripción del propósito del componente.'],
                        [
                            'inlineData' => [
                                'mimeType' => $mimeType,
                                'data' => $imageData
                            ]
                        ]
                    ]
                ]
            ]
        ];

        // Enviar petición
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post($endpoint, $payload);

        // Procesar respuesta
        if ($response->successful()) {
            return response()->json([
                'respuesta' => $response->json()['candidates'][0]['content']['parts'][0]['text'] ?? 'Sin respuesta'
            ]);
        }

        return response()->json([
            'error' => 'Error de API',
            'detalle' => $response->body()
        ], 500);
    }

    
    public function enviarNota(Request $request)
    {
        //Puedes acceder al texto con $request->input('texto')        
        // Y al archivo de audio (si existe) con $request->file('audio')        
        // Aquí solo respondemos éxito        

        return response()->json(['status' => 'success']);
    }

    
}
