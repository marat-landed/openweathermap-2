const param_scale = [ 
    1, // temp, min 
	1, // temp, max
	2, // pressure		Изменить на 2
	5, // humidity
	0.5, // wind_speed
	10, // wind_deg 		Изменить на 10
	10, // clouds		Изменить на 10
	10, // pop			Изменить на 10
	2, // rain			Изменить на 2
	2 ]; // snow		Изменить на 2
	
const param_name_str = 
			[ [ "temp", "min" ], [ "temp", "max" ], [ "pressure" ], [ "humidity" ], 
			  [ "wind_speed" ], [ "wind_deg" ], [ "clouds" ], [ "pop" ], [ "rain" ], 
			  [ "snow" ], [ "weather", "icon" ] ];
const openweathermap_place = 
  [ [ 49.9541962, 36.0966085, "Pisochyn", "Песочин, Украина, Харьковская область" ],
	[ 61.217381, -149.863129, "Anchorage", "Анкоридж, США, Аляска" ],
	[ -54.81084, -68.31591, "Ushuaia", "Ушуая, Аргентина, Огненная Земля" ],
	[ 9.005401, 38.763611, "Addis_Ababa", "Аддис-Абеба, Эфиопия" ],
	[ 63.460899, 142.785812, "Oymyakon", "Оймякон, Россия, Республика Саха (Якутия)" ],
	[ -77.846, 166.676, "McMurdo", "Мак-Мердо, США" ] ];
const database_URL = "https://open-weather-map-2-default-rtdb.europe-west1.firebasedatabase.app";
//const database_URL = "https://probe-web-default-rtdb.europe-west1.firebasedatabase.app"; // Probe-web
const Chart_title_arr = ['Температура минимальная', 'Температура максимальная', 'Давление', 'Влажность', 'Скорость ветра', 'Направление ветра', 'Облачность', 'Вероятность осадков', 'Дождь', 'Снег', 'Погода'];
const yAxis_title_arr = ['градусов', 'градусов', 'гПа', '%', 'м/с', 'градусов', '%', '%', 'мм', 'мм'];

export { param_scale, param_name_str, openweathermap_place, database_URL, Chart_title_arr, yAxis_title_arr };


