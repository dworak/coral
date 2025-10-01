'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Wind, 
  Thermometer, 
  Droplets, 
  SunDim,
  CloudSnow
} from 'lucide-react';

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  irradiation: number;
  condition: string;
  pressure: number;
  uvIndex: number;
}

export default function WeatherCard() {
  const [weatherData, setWeatherData] = useState<WeatherData>({
    temperature: 22,
    humidity: 65,
    windSpeed: 12,
    irradiation: 850,
    condition: 'partly-cloudy',
    pressure: 1013,
    uvIndex: 6
  });

  useEffect(() => {
    // Simulate real-time weather data updates
    const timer = setInterval(() => {
      setWeatherData(prev => ({
        ...prev,
        temperature: prev.temperature + (Math.random() - 0.5) * 2,
        humidity: Math.max(30, Math.min(90, prev.humidity + (Math.random() - 0.5) * 5)),
        windSpeed: Math.max(0, prev.windSpeed + (Math.random() - 0.5) * 3),
        irradiation: Math.max(0, prev.irradiation + (Math.random() - 0.5) * 50),
        pressure: prev.pressure + (Math.random() - 0.5) * 2,
        uvIndex: Math.max(0, Math.min(11, prev.uvIndex + (Math.random() - 0.5) * 1))
      }));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(timer);
  }, []);

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny':
        return <Sun className="h-8 w-8 text-yellow-500" />;
      case 'partly-cloudy':
        return <SunDim className="h-8 w-8 text-yellow-400" />;
      case 'cloudy':
        return <Cloud className="h-8 w-8 text-gray-500" />;
      case 'rainy':
        return <CloudRain className="h-8 w-8 text-blue-500" />;
      case 'snowy':
        return <CloudSnow className="h-8 w-8 text-blue-300" />;
      default:
        return <Sun className="h-8 w-8 text-yellow-500" />;
    }
  };

  const getWeatherCondition = (condition: string) => {
    switch (condition) {
      case 'sunny':
        return 'Słonecznie';
      case 'partly-cloudy':
        return 'Częściowo pochmurnie';
      case 'cloudy':
        return 'Pochmurnie';
      case 'rainy':
        return 'Deszczowo';
      case 'snowy':
        return 'Śnieżnie';
      default:
        return 'Słonecznie';
    }
  };

  const getUVIndexColor = (uvIndex: number) => {
    if (uvIndex <= 2) return 'text-green-600 bg-green-100';
    if (uvIndex <= 5) return 'text-yellow-600 bg-yellow-100';
    if (uvIndex <= 7) return 'text-orange-600 bg-orange-100';
    if (uvIndex <= 10) return 'text-red-600 bg-red-100';
    return 'text-purple-600 bg-purple-100';
  };

  const getUVIndexLabel = (uvIndex: number) => {
    if (uvIndex <= 2) return 'Niski';
    if (uvIndex <= 5) return 'Umiarkowany';
    if (uvIndex <= 7) return 'Wysoki';
    if (uvIndex <= 10) return 'Bardzo wysoki';
    return 'Ekstremalny';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Stacja pogodowa
        </CardTitle>
        <CardDescription>
          Aktualne warunki pogodowe i nasłonecznienie
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Main Weather Display */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getWeatherIcon(weatherData.condition)}
              <div>
                <div className="text-3xl font-bold">
                  {Math.round(weatherData.temperature)}°C
                </div>
                <div className="text-sm text-muted-foreground">
                  {getWeatherCondition(weatherData.condition)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(weatherData.irradiation)} W/m²
              </div>
              <div className="text-sm text-muted-foreground">
                Nasłonecznienie
              </div>
            </div>
          </div>

          {/* Weather Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Droplets className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-sm text-muted-foreground">Wilgotność</div>
                <div className="font-semibold">{Math.round(weatherData.humidity)}%</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Wind className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-sm text-muted-foreground">Wiatr</div>
                <div className="font-semibold">{Math.round(weatherData.windSpeed)} km/h</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Thermometer className="h-4 w-4 text-red-500" />
              <div>
                <div className="text-sm text-muted-foreground">Ciśnienie</div>
                <div className="font-semibold">{Math.round(weatherData.pressure)} hPa</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Sun className="h-4 w-4 text-yellow-500" />
              <div>
                <div className="text-sm text-muted-foreground">Indeks UV</div>
                <div className="font-semibold">{Math.round(weatherData.uvIndex)}</div>
              </div>
            </div>
          </div>

          {/* UV Index Status */}
          <div className="text-center">
            <Badge 
              variant="outline" 
              className={`${getUVIndexColor(weatherData.uvIndex)} border-0`}
            >
              Indeks UV: {getUVIndexLabel(weatherData.uvIndex)}
            </Badge>
          </div>

          {/* Solar Irradiation Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0 W/m²</span>
              <span>1000 W/m²</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((weatherData.irradiation / 1000) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Weather Impact on Solar */}
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">
              Wpływ na produkcję energii
            </div>
            <div className="text-lg font-semibold text-blue-600">
              {weatherData.irradiation > 600 ? 'Optymalne warunki' : 
               weatherData.irradiation > 300 ? 'Umiarkowane warunki' : 
               'Niskie nasłonecznienie'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
