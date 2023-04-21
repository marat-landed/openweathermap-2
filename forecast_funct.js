import axios, * as others from 'axios';
import { initializeApp } from 'firebase/app';
import {
  getDatabase,
  goOnline,
  goOffline,
  onValue,
  set,
  get,
  child,
  ref,
} from 'firebase/database';

import {param_scale} from "./js/myconst.js";
import {param_name_str} from "./js/myconst.js";
import {database_URL} from "./js/myconst.js";

const firebaseConfig = {
  databaseURL: database_URL,
};
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const FORECASTS_SIZE = 8;
const DATE_MEM_SIZE = 20;

const myMain = async (global_path, openweathermap_address, allow_output) => {
  // 1 Получить прогноза
  const response = await axios.get(openweathermap_address);
  // 2 Получить текщее время прогноза (информационно, для формирования строки ошибок со временем)
  let date = await get_date_from_response(response);
  // 3 В цикле по каждому параметру прогноз обработать
  for (let param_no = 0; param_no < param_name_str.length; param_no++) {
	// 3.1 Извлечь 8 значений параметра и сформировать строку
	let forecast_new_str = await GetNewForecast_param(response, param_no, date, allow_output);
	// 3.2 Извлечь из БД массив строк прогноза данного параметра
	let forecasts_str_arr = await GetArchiveForecasts_param(global_path, param_no, allow_output);
	// 3.3 Добавить в этот массив новую строку прогнозов и вернуть новый массив строк прогноза
	forecasts_str_arr = await AddStringArchiveForecasts_param(param_no, forecasts_str_arr, forecast_new_str, allow_output);
	// 3.4 Записать новый массив строк прогнозов данного параметра в БД
	await SetNewArchiveForecasts_param(global_path, param_no, forecasts_str_arr, allow_output);
	
	if ((param_no < param_name_str.length-1) && (forecasts_str_arr.length > 1)) {
	  // 3.5 Найти ошибки прогноза и сформировать новый массив ошибок прогноза (на 1, 2, ..., 7 дней)
	  let error_arr = await determine_errors_forecast_param(forecasts_str_arr, param_no, allow_output);
	  // 3.6 Извлечь из БД массив строк ошибок прогноза этого параметра
	  let errors_str_arr = await GetArchiveErrors_param(global_path, param_no, allow_output);
	  // 3.7 Добавить новую строку ошибок
	  errors_str_arr = await AddStringArchiveErrors_param(param_no, errors_str_arr, error_arr, date, allow_output);
	  // 3.8 Записать новый массив строк ошибок в БД
	  await SetNewArchiveErrors_param(global_path, param_no, errors_str_arr, allow_output);
	  // 3.9 Извлечь из БД массив строк распределений ошибок (7 строк по 11 значений)
	  let distribs_str_arr = await GetArchiveDistribs_param(global_path, param_no, allow_output);
	  // 3.10 На основе массива ошибок прогноза обновить массив строк распределений
	  distribs_str_arr = await UpdateDistribs_param(distribs_str_arr, error_arr, param_no, allow_output);
	  // 3.11 Записать в БД новый массив строк распределений ошибок прогноза данного параметра. Завершить итерацию цикла.
	  await SetNewDistribs_param(global_path, param_no, distribs_str_arr, allow_output);
	}
  }
  // 4 Записать времяя прогноза
  await SetDateForecasts(global_path, allow_output);
}

const get_date_from_response = async (response) => {
// Получить текщее время прогноза (информационно, для формирования строки ошибок со временем)
  return response.data.daily[0].dt;
}

const GetNewForecast_param = async (response, param_no, date, allow_output) => {
// Из строки прогноза response извлекает прогноз для заданного параметра param_no 
// и возвращает строку прогноза.
  var param_str = date.toString(); // дата
  for (let i = 0; i < 8; i++) {
    if (param_no == param_name_str.length-1) {
	  // weather-icon
	  var param = response.data.daily[i][param_name_str[param_no][0]][0][param_name_str[param_no][1]];
	  param_str += " " + param;
	} else {
	  // остальные  
	  if (param_name_str[param_no].length == 1)	{
	    var param = response.data.daily[i][param_name_str[param_no]];
		// Вероятность осадков переводим в проценты
		if (param_name_str[param_no] == "pop") param *=100;
	  }
	  else
	    var param = response.data.daily[i][param_name_str[param_no][0]][param_name_str[param_no][1]];
	  if (param == null) param = 0;
	  param_str += " " + param.toString();
	}
  }
  
  if (allow_output) {
    console.log("");
    console.log("........................................................");
    console.log("----- Сформирована новая строка прогноза " + param_name_str[param_no] + " -----:");
    console.log(param_no, param_name_str[param_no], param_str);	
  }
  return param_str;	
}

const GetArchiveForecasts_param = async (global_path, param_no, allow_output) => {
// Из БД извлекает архив прогнозов данного параметра param_no и возвращает его
  let forecasts_str_arr = [];
  //console.log("FORECASTS_SIZE:",FORECASTS_SIZE);
  for (let i = 0; i < FORECASTS_SIZE; i++) {
    let path = global_path + "/forecast/";
	let path_unit = param_name_str[param_no];
    if (path_unit.length == 1)
      path += path_unit + "/" + i.toString();
    else
      path += path_unit[0] + "/" + path_unit[1] + "/" + i.toString();
    // Читаем одну строку
	var paramRef = ref(database, path);
	var snapshot = await get(ref(database, path));
    var data = await snapshot.val(); 
	if( data != null ) {
	  forecasts_str_arr.push(data);
	} else {
	  break;
	}
  }
  
  if (allow_output) {
    console.log("----- Old forecasts_str_arr -----:");
    console.log(param_no, param_name_str[param_no], forecasts_str_arr);	
  }
  return forecasts_str_arr;	
}

const AddStringArchiveForecasts_param = async (param_no, forecasts_str_arr, forecast_new_str, allow_output) => {
// Добавляет строку нового прогноза к имеющемуся массиву прогнозов и 
// возвращает новый массив строк прогноза параметра
  let forecasts_num = Math.min(FORECASTS_SIZE-1,forecasts_str_arr.length);
  let j = forecasts_num;
  if (forecasts_num > 0) {
    for (let i = 0; i < forecasts_num; i++) {
      forecasts_str_arr[j] = forecasts_str_arr[j - 1];
      j--;
    }
  }
  
  forecasts_str_arr[0] = forecast_new_str;
  // Гарантировано forecasts_str_arr не более 8 эл-тов
  
  if (allow_output) {
    console.log("----- Новый forecasts_str_arr -----:");
    console.log(param_no, param_name_str[param_no], forecasts_str_arr);
  }
  return forecasts_str_arr; 
}

const SetNewArchiveForecasts_param = async (global_path, param_no, forecasts_str_arr, allow_output) => {
// Записывает обновленный массив строк прогноза в БД
  let num = forecasts_str_arr.length;
  //if (num == FORECASTS_SIZE) num--;
  let path_unit = param_name_str[param_no];
  for (let i = 0; i < num; i++) {
    let path = global_path + "/forecast/";
    if (path_unit.length == 1)
      path += path_unit + "/" + i.toString();
    else
      path += path_unit[0] + "/" + path_unit[1] + "/" + i.toString();
    const tasksRef = ref(database, path);
    await set(tasksRef, forecasts_str_arr[i]);
  }
  
  if (allow_output) {
    console.log("----- Записан forecasts_str_arr -----:");
    console.log(param_no, param_name_str[param_no], forecasts_str_arr);
  }
}

const determine_errors_forecast_param = async (forecasts_str_arr, param_no, allow_output) => {
// Найти ошибки прогноза и сформировать новый массив ошибок прогноза (на 1, 2, ..., 7 дней)
  // Значение параметра на сегодня
  //console.log("23",forecasts_str_arr);
  let utc, utc_today, utc_dt, value_today;
  // В массиве error_arr накапливаем ошибки, определенные для полученного прогноза на 1..7 дней.
  // Массив предварительно инициализируется значениями 1000, т.к. не для каждого элемента может быть определено значение
  // ввиду возможных пропусков получения прогноза (не каждый день).
  var error_arr = [];
  for (let i = 0; i < FORECASTS_SIZE - 1; ++i) error_arr.push(10000);
  let path_unit = param_name_str[param_no];
  
  for (let i = 0; i < forecasts_str_arr.length; i++) {
    let forecast_temprary = forecasts_str_arr[i];  // Одна строка прогноза из массива
	//console.log("23",i,forecast_temprary);
	// Строку превращаем в массив чисел (заполняется массив param_array[9])
	//ConvertStrToArrayStr(forecast_temprary, param_array);
	let param_array = forecast_temprary.split(' ').map(Number);
	//console.log(param_array);
    if (i == 0) {
      utc_today = param_array[0];
      value_today = param_array[1];
      continue;
    }
    utc = param_array[0];
    // Определяем, на сколько дней отстоит этот прогноз от сегодняшнего
    // Разница во времени между сегодняшним прогнозом и текущим (считанным)
    utc_dt = utc_today - utc;
    
    // Число дней между сегодняшним прогнозом и текущим (считанным)
    let d_day = utc_dt / 86400;
	//console.log(utc_today, value_today, utc_dt, d_day);
    // Ошибка прогноза на d_day (не далее 7 дней, прогнозы из-за пропусков дней могут быть старше, они не нужны)
    // Предполагается, что d_day всегда больше 1. В эксперименте м.б. = 0;
    if ((d_day < 8) && (d_day >= 1) && (utc_dt % 86400 === 0)) {
      let value_forecast = param_array[d_day + 1];
      error_arr[d_day - 1] = Math.abs(value_today - value_forecast);
    } else break;
  }
  // Если это ошибки для направления ветра, то приводим их к величине до 180 градусов (больше быть не может)
  if (path_unit[0] == "wind_deg") {
    for (let i1 = 0; i1 < FORECASTS_SIZE - 1; i1++) {
      if ((error_arr[i1] > 180)  && (error_arr[i1] < 9000))
        error_arr[i1] = 360 - error_arr[i1];
    }
  }
  
  if (allow_output) {
    console.log("----- New errors_arr -----:");
    console.log(param_no, param_name_str[param_no], error_arr);
  }
  return error_arr;
  // Сейчас в массиве error_arr[7] содержатся либо ошибки прогноза
  // данного параметра по дням, либо значения 1000 (если не было
  // соответствующего прогноза вследствие пропуска дней)
}

const GetArchiveErrors_param = async (global_path, param_no, allow_output) => {
// Извлекает из БД массив строк (архив) ошибок прогноза этого параметра param_no
  let errors_str_arr = [];
  for (let i = 0; i < FORECASTS_SIZE-1; i++) {
    let path = global_path + "/error/";
	let path_unit = param_name_str[param_no];
    if (path_unit.length == 1)
      path += path_unit + "/" + i.toString();
    else
      path += path_unit[0] + "/" + path_unit[1] + "/" + i.toString();
    // Читаем одну строку
	var paramRef = ref(database, path);
	var snapshot = await get(ref(database, path));
    var data = await snapshot.val(); 
	if( data != null ) {
	  errors_str_arr.push(data);
	} else {
	  break;
	}
  }
  
  if (allow_output) {
    console.log("----- Old errors_str_arr -----:");
    console.log(param_no, param_name_str[param_no], errors_str_arr);	
  }
  return errors_str_arr;	
}

const AddStringArchiveErrors_param = async (param_no, errors_str_arr, error_arr, date, allow_output) => {
// Добавляет новую строку ошибок прогноза к имеющемуся массиву прогнозов и 
// возвращает новый массив строк ошибок прогноза параметра (массив не более 7 строк (FORECASTS_SIZE-1)).
// Строка ошибок - дата и 7 значений ошибок прогнозов на 1, 2,..., 7 дней
  let errors_num = Math.min(FORECASTS_SIZE-2,errors_str_arr.length);
  let j = errors_num;
  if (errors_num > 0) {
    for (let i = 0; i < errors_num; i++) {
      errors_str_arr[j] = errors_str_arr[j - 1];
      j--;
    }
  }
  
  // Формируем строку из массива чисел
  let error_new_str = date.toString();
  for (let i=0; i<error_arr.length; i++) 
	error_new_str+= " " + error_arr[i].toString(); 
  // Добавляем строку в массив строк ошибок
  errors_str_arr[0] = error_new_str;
  // Гарантировано errors_str_arr не более 7 эл-тов
  
  if (allow_output) {
    console.log("----- New errors_str_arr -----:");
    console.log(param_no, param_name_str[param_no], errors_str_arr);
  }
  return errors_str_arr; 
}

const SetNewArchiveErrors_param = async (global_path, param_no, errors_str_arr, allow_output) => {
// Записывает обновленный массив строк ошибок в БД
  let num = errors_str_arr.length;
  //if (num == FORECASTS_SIZE) num--;
  let path_unit = param_name_str[param_no];
  for (let i = 0; i < num; i++) {
    let path = global_path + "/error/";
    if (path_unit.length == 1)
      path += path_unit + "/" + i.toString();
    else
      path += path_unit[0] + "/" + path_unit[1] + "/" + i.toString();
    const tasksRef = ref(database, path);
    await set(tasksRef, errors_str_arr[i]);
  }
  
  if (allow_output) {
    console.log("----- Записан errors_str_arr -----:");
    console.log(param_no, param_name_str[param_no], errors_str_arr);
  }
}

const GetArchiveDistribs_param = async (global_path, param_no, allow_output) => {
// Извлекает из БД массив строк (архив) распределений ошибок прогноза этого параметра param_no
// 7 строк: на 1 день, 2 дня,...
// В каждой строке 
  let distribs_str_arr = [];
  for (let i = 0; i < FORECASTS_SIZE-1; i++) {
    let path = global_path + "/distrib/";
	let path_unit = param_name_str[param_no];
    if (path_unit.length == 1)
      path += path_unit + "/" + i.toString();
    else
      path += path_unit[0] + "/" + path_unit[1] + "/" + i.toString();
    // Читаем одну строку
	var paramRef = ref(database, path);
	var snapshot = await get(ref(database, path));
    var data = await snapshot.val(); 
	if( data != null ) {
	  distribs_str_arr.push(data);
	} else {
	  break;
	}
  }
  
  if (allow_output) {
    console.log("----- Old distribs_str_arr -----:");
    console.log(param_no, param_name_str[param_no], distribs_str_arr);	
  }
  return distribs_str_arr;	
}

const UpdateDistribs_param = async (distribs_str_arr, error_arr, param_no, allow_output) => {
// Обновление распределения ошибок прогнозов distribs_str_arr параметра param_no
// Строка - распределение ошибок на один день. Всего 7 строк. В каждой строке - 11 чисел - количество ошибок в данном диапазоне.
// Получает: 
// 1) массив строк распределений ошибок distribs_str_arr (7 строк или ничего)
// 2) массив ошибок прогноза для одного параметра error_arr[FORECASTS_NUM - 1] // 7
// 3) Номер параметра param_no
// Возвращает: обновленный массив строк распределений ошибок distribs_str_arr.

  // Массив param_scale[10] определяет шаг приращения точек на шкале погрешностей. Например, "1" обозначает,
  // что есть 10 значений: 1,2,3,...,10; 0.5: 0.5, 1.0, 1.5,..., 5.
  // Соответственно погршности распределены в таких диапазонах: меньше 1, 
  // от 1 включительно до 2 исключительно,..., от 9 включительно до 10 исключительно,
  // от 10 и более. Всего 11 диапазонов.
  // В массиве ошибок error_arr может быть такое содержание: [1.2, 1.8, 10000, 10000, 2.7, 2.6, 10000]
  // 1.2 - ошибка прогноза на 1 день, 1.8 - ошибка на 2 дня, 1000 - ошибка прогноза не вычислялась на этот день
  // По значению error_arr[0] необходимо обновить 1-ю строку distribution_str_arr[0] и т.д.
  // Обновить - значит найти, в каком месте строки добавить единицу.
  let par_scale = param_scale[param_no];
  
  for (let i = 0; i < FORECASTS_SIZE - 1; i++) {
	// i - номер дня прогноза
	let distrib_1_str_array = [];  // распределение ошибок на один день
    for (let i1 = 0; i1 < 11; i1++) {
      distrib_1_str_array.push(0);
    }
    // Ищем место добавления единицы (всего 11 мест)
    let err_curr = error_arr[i];
    if (err_curr > 9000) {
	  if (distribs_str_arr[i] == null) {
		distribs_str_arr[i] = "0";
		for (let i1 = 1; i1 < 11; i1++)
          distribs_str_arr[i] += " 0";  
	  }
	  continue;
	}	
    let index_err = Math.min(10, (err_curr / par_scale) | 0);
    // Строку превращаем в массив (заполняется массив param_str_array[9])
	//console.log("distribs_str_arr[i]",distribs_str_arr[i]);
    if (distribs_str_arr[i] != null)
	  distrib_1_str_array = distribs_str_arr[i].split(' ').map(Number);
      //ConvertStrToArrayStr(distribs_str_arr[i], distrib_1_str_array);
    distrib_1_str_array[index_err]+= 1;
    // Обратное превращение числового массива distrib_1_str_array в одну строку массива distribs_str_arr[i]
    distribs_str_arr[i] = "" + distrib_1_str_array[0];
    for (let i1 = 1; i1 < 11; i1++) {
      distribs_str_arr[i] += " " + distrib_1_str_array[i1];
    }
  }

  if (allow_output) {
    console.log("----- New distribs_str_arr -----:");
    console.log(param_no, param_name_str[param_no], distribs_str_arr);
  }	
  return distribs_str_arr;	
}

const SetNewDistribs_param = async (global_path, param_no, distribs_str_arr, allow_output) => {
// Записывает обновленный массив строк распределения ошибок в БД
  let num = distribs_str_arr.length;
  let path_unit = param_name_str[param_no];
  for (let i = 0; i < num; i++) {
    let path = global_path + "/distrib/";
    if (path_unit.length == 1)
      path += path_unit + "/" + i.toString();
    else
      path += path_unit[0] + "/" + path_unit[1] + "/" + i.toString();
    const tasksRef = ref(database, path);
    await set(tasksRef, distribs_str_arr[i]);
  }
  if (allow_output) {
    console.log("----- Записан новый distribs_str_arr -----:");
    console.log(param_no, param_name_str[param_no], distribs_str_arr);
  }
}

const DateLast = async (global_path) => {
// Из БД извлекает первую строку прогноза t_min (самый свежий прогноз) и из неё - последнее время прогноза
  let date_last = 0;
  let path = global_path + "/forecast/temp/min/0";
  // Читаем одну строку
  let paramRef = ref(database, path);
  var snapshot = await get(ref(database, path));
  var data = await snapshot.val(); 
  if( data != null ) {
	let param_array = data.split(' ').map(Number);
	date_last = param_array[0];
  };
  return date_last;	
}

const SetDateForecasts = async (global_path, allow_output) => {
// текущая дата
  let date = new Date();
  let year = date.getFullYear(); // Получить год (4 цифры)
  let month = date.getMonth() + 1; // Получить месяц, от 0 до 11.
  let day = date.getDate(); // Получить день месяца, от 1 до 31, что несколько противоречит названию метода.
  let hour = date.getHours(); // час в вашем текущем часовом поясе
  let minutes = date.getMinutes();
  let seconds = date.getSeconds(); // getMilliseconds()
  let date_str = day.toString() + "-" + month.toString() + "-" + year.toString() + " " +
		    hour.toString() + ":" + minutes.toString() + ":" + seconds.toString();
  
  // Записываем строку даты прогноза
  // Читаем из базы данных записи даты и формируем массив строк. В строке дата записи.
  let date_str_arr = [];
  let arr_length = 0;
  for (let i = 0; i < DATE_MEM_SIZE; i++) {
    let path = global_path + "/date/" + i.toString();
	// Читаем одну строку
	var paramRef = ref(database, path);
	var snapshot = await get(ref(database, path));
    var data = await snapshot.val(); 
	if( data != null ) {
	  date_str_arr.push(data);
	} else {
	  break;
	}
  }
  
  // Перестановка. Порядок расположения записей "дата-память": 0 - самый свежий и т.д. до DATE_MEM_NUM - самый старый.
  // Меняем порядок: сдвигаем имеющиеся прогнозы на одно место вниз, т.е. 0 -> 1 и т.д.
  // Освобождаем 0 для нового прогноза.
  // Если последний прогноз имеет номер DATE_MEM_NUM-1, то он не будет записан, а уйдет. Всего не более DATE_MEM_NUM строк.
  let num = Math.min(DATE_MEM_SIZE-1,date_str_arr.length);
  let j = num;
  if (num > 0) {
    for (let i = 0; i < num; i++) {
      date_str_arr[j] = date_str_arr[j - 1];
      j--;
    }
  }
  
  date_str_arr[0] = date_str;
  
  // Записываем
  num = date_str_arr.length;
  for (let i = 0; i < num; i++) {
    let path = global_path + "/date/" + i.toString();
    const tasksRef = ref(database, path);
    await set(tasksRef, date_str_arr[i]);
  }
  
  if (allow_output) {
    console.log("----- Записаны даты прогноза -----:");
    console.log(date_str_arr);
  } 
}

export const MainForec = async (global_path, openweathermap_address, allow_output) => {
  // Вызывается из get_forecast.js в случае, если сегодняшний прогноз не записан,
  // т.е. функция today_forecast_recorded вернула false
  await myMain(global_path, openweathermap_address, allow_output);
  goOffline(database);
}

export const today_forecast_recorded = async (openweathermap_address, global_path) => {
  // Проверяем, записан ли сегодняшний прогноз в Firebase
  // Вызывается из get_forecast.js для проверки: записан ли сегодняшний прогноз.
  // Еси прогноз записан, возвращает true и наоборот.
  // Какое время прогноза выдает Openweathemap?
  // 1 Получить прогноза
  //console.log(openweathermap_address);
  //return true;
  const response = await axios.get(openweathermap_address);
  // 2 Получить текщее время прогноза (информационно, для формирования строки ошибок со временем)
  let date = await get_date_from_response(response);
  // Какое время прогноза записано?
  let date_last = await DateLast(global_path);
  // Если даты совпадаю, прогноз уже записан, возвращает true
  let already_recorded = date == date_last;
  if (already_recorded) goOffline(database);
  return already_recorded;
}