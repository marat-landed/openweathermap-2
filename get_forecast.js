// 01-04-23 Вызов программы получения прогнозов с Openweathemap
// Для использования в GitHub посредством Cron.
// Последняя редакция 01-04-23, 18-04-23.
// Этот модуль выывается cron периодически (по расписанию, например, один раз в час круглые сутки)
// В модуле выполняется процедура get_forecast_openweathermap.

//import colors from 'colors';
import { MainForec } from './forecast_funct.js';
import { today_forecast_recorded } from './forecast_funct.js';
import { openweathermap_place } from "./js/myconst.js";
import { goOffline_fun } from "./forecast_funct.js";

let allow_output = false;

async function get_forecast_openweathermap_1(i) {
  // Для одного места (н.п.)
  // Формируем адрес
  let lon = openweathermap_place[i][1];
  let place_name = openweathermap_place[i][3];
  // По долготе определяем часовой пояс
  let timezone = Math.floor((lon+7.5)/15); // Округление вниз
	//console.log(i+1,place_name,"timezone:",timezone);
	// Определяем время UTC
	let date = new Date();
	let UTCHours = date.getUTCHours();
	// Определяем местное время
	let local_time = UTCHours + timezone;
	if (local_time < 0) local_time += 24;
	if (local_time > 23) local_time = local_time - 24;
	console.log("local_time:",local_time);
	// Если местное время больше 13 и меньше 15 (включительно), то пытаемся записать прогноз
	if ((local_time > 9) && (local_time < 16)) {
	  console.log("Проверяем, зписан ли прогноз для",place_name);
	  let lat = openweathermap_place[i][0];
	  let address = 'http://api.openweathermap.org/data/2.5/onecall?lat=' +
	    lat + '&lon=' + lon +
	    '&exclude=current,minutely,hourly,alerts&units=metric&appid=25446dc6c2ea52216ff635d00e0fcca9';
	  // Записан ли уже прогноз для этого места?
	  let place_name_short = openweathermap_place[i][2]; // forec_gh, forec_probe
	  //console.log("place_name_short:",place_name_short);
	  let already_recorded = await today_forecast_recorded(address, place_name_short);
	  console.log("Результат проверки для",place_name,":",already_recorded);
      if (!already_recorded) { 
        // Записываем прогноз
		await MainForec(place_name_short, address, allow_output); // allow_output
        console.log("Прогноз для",place_name,"записан!");
      } else {
	    // Прогноз уже записан, записывать больше не нужно.
	    console.log("Прогноз для",place_name,"за сегодня уже записан! Обновление не требуется.");  
      }
	} else {
	  console.log(place_name,"время local_time =",local_time,"вне пределов 13-15.");
	}
}

async function get_forecast_openweathermap_all() {
  // Для всех мест (н.п.)
  for (let i=0; i < openweathermap_place.length; i++) {
	let place_name = openweathermap_place[i][3];
	console.log(i+1,place_name);
    await get_forecast_openweathermap_1(i);
  }
  goOffline_fun();
}

get_forecast_openweathermap_all();