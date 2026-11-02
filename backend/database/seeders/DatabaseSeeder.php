<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            ['Botella Esencial', 'Acero inoxidable. Tu bebida a la temperatura ideal, vayas donde vayas.', 'Bienestar', 2400, '#e1e7d8', '🍶'],
            ['Cuaderno de Ideas', 'Papel de 120 g, cubierta flexible y espacio para lo que viene.', 'Escritorio', 1600, '#eee0d2', '📔'],
            ['Bolso Cotidiano', 'Algodón resistente y espacio para tus esenciales de cada día.', 'Accesorios', 3200, '#e5e1d6', '👜'],
            ['Audífonos Studio', 'Sonido envolvente, diseño ligero y hasta 30 horas de autonomía.', 'Accesorios', 6900, '#dae0e4', '🎧'],
            ['Taza de Pausa', 'Cerámica esmaltada para disfrutar cada pequeño descanso.', 'Bienestar', 1800, '#e7d9ce', '☕'],
            ['Lámpara de Mesa', 'Luz cálida regulable. Un punto de calma en tu escritorio.', 'Escritorio', 4800, '#e2e5ce', '💡'],
        ];
        foreach ($products as [$name,$description,$category,$price,$color,$icon]) {
            Product::firstOrCreate(['name' => $name], compact('description', 'category', 'price', 'color', 'icon') + ['stock' => 100]);
        }
    }
}
