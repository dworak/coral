'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Zap } from 'lucide-react';

export default function ActivePowerClock() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentPower, setCurrentPower] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      // Simulate real-time power data
      const hour = new Date().getHours();
      const minute = new Date().getMinutes();
      
      // Simulate power based on time of day (higher during daylight hours)
      let simulatedPower = 0;
      if (hour >= 6 && hour < 18) {
        // Peak around noon, gradual increase/decrease
        const timeOfDay = hour + minute / 60;
        const peakHour = 12;
        const distanceFromPeak = Math.abs(timeOfDay - peakHour);
        const maxPower = 45.8; // kW
        simulatedPower = Math.max(0, maxPower * (1 - distanceFromPeak / 6));
      }
      
      // Add some random variation
      simulatedPower += (Math.random() - 0.5) * 2;
      simulatedPower = Math.max(0, simulatedPower);
      
      setCurrentPower(simulatedPower);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pl-PL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPowerStatus = (power: number) => {
    if (power === 0) return { status: 'Brak produkcji', color: 'text-gray-500', bgColor: 'bg-gray-100' };
    if (power < 10) return { status: 'Niska produkcja', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    if (power < 30) return { status: 'Średnia produkcja', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    return { status: 'Wysoka produkcja', color: 'text-green-600', bgColor: 'bg-green-100' };
  };

  const powerStatus = getPowerStatus(currentPower);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Moc czynna
        </CardTitle>
        <CardDescription>
          Aktualna moc produkcji energii elektrycznej
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Time Display */}
          <div className="text-center">
            <div className="text-4xl font-mono font-bold text-gray-900">
              {formatTime(currentTime)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {formatDate(currentTime)}
            </div>
          </div>

          {/* Power Display */}
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-blue-600">
              {currentPower.toFixed(1)} kW
            </div>
            <Badge 
              variant="outline" 
              className={`${powerStatus.color} ${powerStatus.bgColor} border-0`}
            >
              <Zap className="h-3 w-3 mr-1" />
              {powerStatus.status}
            </Badge>
          </div>

          {/* Power Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0 kW</span>
              <span>50 kW</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((currentPower / 50) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4 text-center text-sm">
            <div>
              <div className="text-muted-foreground">Dzisiejsza produkcja</div>
              <div className="font-semibold text-green-600">
                {(currentPower * 0.1).toFixed(1)} kWh
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Efektywność</div>
              <div className="font-semibold text-blue-600">
                {((currentPower / 45.8) * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
