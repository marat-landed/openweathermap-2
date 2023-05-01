// 02-05-2022 Версия для МК NodeMCU
// 16-02-2023 Данные и LittleFS

//import {openweathermap_place} from "./myconst.js";

var chartT, // 'chart-temperature'
    chartWC, //'div-chart-weather-clouds'
	chartHPP, // 'div-chart-humid-pop-precip'
	chartPW; // 'div-chart-wind-press'
	
var all_last_forecasts_;
	
function plot_last_forecast(all_last_forecasts, openweathermap_place) {
  // Из архива всех прогнозов необходимо сформировать запись вида:
  // {"today_utc": 1676538000,"temp_max":[23,23,23,23,23,23,23,23],"temp_min":[12,12,12,23,23,23,23,23],
  //  "pressure"...,"clouds"...,"precipitation"...,"wind_speed"...,"wind_direct"...,"weather_icon_num"...}
  //console.log(all_last_forecasts);
  /* Получаем объект вида (объекты (н.п.) в объекте all_last_forecasts):
  Object { Pisochyn: {…}, Anchorage: {…}, Ushuaia: {…}, Addis_Ababa: {…}, Oymyakon: {…}, McMurdo: {…} }
  ...
    Pisochyn: Object { "temp/min":
​    Anchorage: Object { "temp/min": "1682283600 -4.45 -5.46 -0.72 0.93 2.53 2.63 3.93 4.98", "temp/max": "1682
    Ushuaia: {…}, 
	Addis_Ababa: {…}, 
	Oymyakon: {…}, 
	McMurdo
​  */
  // Запоминаем
  all_last_forecasts_ = all_last_forecasts;
  // Создаем Radiogroup с названиями места
  // Таблица для размещения названий мест
  let table = document.createElement('table');
  let tbody = document.createElement('tbody');
  table.classList.add("table_place");
  table.appendChild(tbody);
  document.getElementById('place-table').appendChild(table);
  let row;
	
  for(let i=0; i < openweathermap_place.length; i++) {
	let place_value = i;
	let place_name = openweathermap_place[i][3];
	let output = '<input type="radio" id="place_radioButton_' + i + '" name="place" value="' + place_value + '" onclick="data_update(value);">';
	output+= ' &nbsp; <label for="' + place_value + '">' + place_name + '</label> &nbsp;';
	
	if (i%2 == 0) {
	  row = document.createElement('tr');
	  tbody.appendChild(row);
	}
	let td = document.createElement('td');
	td.innerHTML = output;
	row.appendChild(td);
  }
  // Вызываем первое место
  //data_update(0);
  
  Highcharts.setOptions({
	lang: {
		weekdays: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
    }
  });
  
  document.getElementById("place_radioButton_0").click();
}

function data_update (place_index) {
  //var keys = Object.keys(archive['McMurdo']);
  const last_forecasts = all_last_forecasts_[place_index];
  
  //console.log("last_forecasts:",last_forecasts);
  var keys = Object.keys(last_forecasts);
  let place_name, today_utc, forecast = {};
  for (var key = 0; key < keys.length; key++){
	// 1-й элемент - имя места: Песочин,...
	// 2-й элемент - дата
	// 3, 4, 5... - параметры
	if (key == 0) {
	  place_name = last_forecasts[keys[key]];
	  continue;
	}
	var param = last_forecasts[keys[key]];
	//console.log(param);
	// param - строка прогноза вида: 1676538000 -4 -3 2 2 0 2 2 4
	const myArray = param.split(" "); // [ "1678093200", "-1.09", "-0.75", "0.41", "6.27", "0.35", "-0.61", "3.14", "1.09" ]
	//console.log("myArray:", myArray);
	forecast[keys[key]]=[];
	myArray.forEach((element, index) => {
	  // один раз берем время из строки первого параметра: "1682726400 -32.32 -32.89 -31.28 -20.6 -23.37 -23.64 -27.53 -34.13"
	  if ((key == 1) && (index == 0)) {
		today_utc = Number(element);
      }
	  // Далее время опускаем
	  if (index == 0) return; //continue;
	  let val;
	  if (keys[key]=="weather/icon") val = element; 
	  else val = Number(element);
      //if ((keys[key]=="precipitation") || (keys[key]=="wind_speed")) val = val/100.;
      forecast[keys[key]].push(val);	  
	})
  }
  //console.log(place_name, today_utc, forecast);
  plotChart(today_utc, forecast);	
}

//Plot temperature in the temperature chart
function plotChart(today_utc, forecast) {
  //console.log(place_name, today_utc, forecast);
  //console.log(forecast);
  var keys = Object.keys(forecast);
  
  // Преобразуем ко времени 00 часов
  var pointStart_curr = parseInt(today_utc/86400)*86400000;
  //console.log("pointStart_curr:",pointStart_curr); // 1649808000000
  var date = new Date(today_utc*1000);
  var day = date.getDate();
  var month = date.getMonth()+1;
  var year = date.getFullYear();
  //document.getElementById("forecast_date").textContent = day + '-' + month + '-' + year;
  //document.getElementById("place_name").textContent = place_name;
  
  create_chart_temp('div-chart-temperature'); // chartT: 'div-chart-temperature'
  create_chart_weather_clouds('div-chart-weather-clouds'); // chartWC: 'div-chart-weather-clouds'
  create_chart_humid_pop_precip('div-chart-humid-pop-precip'); // chartHPP: 'div-chart-humid-pop-precip'
  create_chart_press_wind('div-chart-wind-press'); // chartWP: 'div-chart-wind-press'
  
  var data = [];
  // 0: 'today_utc', 1: 'temp_max', 2: 'temp_min', 3: 'pressure', 4: 'clouds', 5: 'precipitation',
  // 6: 'wind-speed', 7: 'wind-direct', 8: 'weather_icon_num'
  //for (var key = 1; key < 8; key++){
  for (var key = 0; key < keys.length; key++){
	//if (keys[key]=="today_utc") continue;
	if ((keys[key]=="wind_speed") || (keys[key]=="wind_deg")) {
	  var param = forecast["wind_speed"]; // wind_speed
	  var param1 = forecast["wind_deg"]; // wind_direct
	} else if (keys[key]=="clouds") {
	  var param = forecast["clouds"]; // clouds
	  var param1 = forecast["weather/icon"]; // weather_icon_num
	} else {
	  var param = forecast[keys[key]];
	}
	param.forEach((element, index) => {
	  if ((keys[key]=="wind_speed") || (keys[key]=="wind_deg")) { // ветер: сорость (м/с) и направление
	    data.push([param[index], param1[index]]);
	  }
	  else if (keys[key]=="clouds") {
		var y = param[index]; 
		var weather_icon_str = param1[index];
		var marker = {
		  symbol: 'url(https://openweathermap.org/img/w/' + weather_icon_str + '.png)'
        };
		var serie1 =  {
		  y: y,         
		  marker: marker
        };
		data.push(serie1);
	  }	else {
		data.push(param[index]);  
	  }
	});
				
	if (keys[key]=="temp/max") { // temp_max
	  chartT.series[0].update({
	    pointStart: pointStart_curr,
		data: data //data.data
	  })	
	} else if (keys[key]=="temp/min") { // temp_min
	  chartT.series[1].update({
		pointStart: pointStart_curr,
		data: data //data.data
	  })	
	} 
	else if (keys[key]=="pressure") { // pressure
	  chartPW.series[0].update({
		pointStart: pointStart_curr,
		data: data //data.data
	  })
	}
	else if (keys[key]=="wind_speed") { // McMurdo/forecast/wind_speed
	  chartPW.series[1].update({
		pointStart: pointStart_curr,
		data: data //data.data
	  })
	} else if (keys[key]=="wind_deg") { // McMurdo/forecast/wind_deg
	  chartPW.series[2].update({
		pointStart: pointStart_curr,
		data: data //data.data
	  })
	}
	else if (keys[key]=="clouds") { // clouds
	  chartWC.series[0].update({
		pointStart: pointStart_curr,
		data: data //data.data
	  })
	} 
	else if (keys[key]=="pop") { // McMurdo/forecast/pop
	  chartHPP.series[0].update({
		pointStart: pointStart_curr,
		data: data //data.data
	  })
	}
	else if (keys[key]=="rain") { // McMurdo/forecast/rain
	  chartHPP.series[1].update({
		pointStart: pointStart_curr,
		data: data //data.data
	  })
	}
	else if (keys[key]=="snow") { // McMurdo/forecast/snow
	  chartHPP.series[2].update({
		pointStart: pointStart_curr,
		data: data //data.data
	  })
	}
	else if (keys[key]=="humidity") { // McMurdo/forecast/humidity
	  chartHPP.series[3].update({
		pointStart: pointStart_curr,
		data: data //data.data
	  })
	}
	data = [];
  }
  chartT.yAxis[0].setExtremes(chartT.yAxis[0].dataMin, chartT.yAxis[0].dataMax);
}

var langWindDir = new Array("N", "NNE", "NE", "ENE","E", "ESE", "SE", "SSE","S", "SSW", "SW", "WSW","W", "WNW", "NW", "NNW", "N");
function windDirLang ($winddir){
  return langWindDir[Math.floor(((parseInt($winddir,10) + 11.25) / 22.5))];
}
function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Create Temperature Chart
function create_chart_temp(renderTo) {
	
  //Highcharts.chart([renderTo], options [, callback]);
  //or
  //new Highcharts.Chart([renderTo], options [, callback]);

	
  chartT = new Highcharts.Chart(renderTo,{	
    //chart: {
    //  type: 'spline',
    //  inverted: false
	//},
	title: {
	  //text: "Temperature",
	  text: 'Температура'
	  //align: 'left'
	},
	time: {
	  //useUTC: false, //timezone: 'Europe/Helsinki'
	},
	plotOptions: {
        series: {
            pointInterval: 24 * 3600 * 1000 // one day
        }
    },
	legend: {
      layout: "horizontal",
      align: "left",
      useHTML: true,
      maxHeight: 60,
      labelFormatter: function () {
        let color = hexToRgb(this.color);
        if (!this.visible) {
          color = { r: 204, g: 204, b: 204 };
        }
        var symbol = `<span class="chartSymbol" style="background: rgba(${color.r},${color.g},${color.b},0.1) 0% 0% no-repeat padding-box;border: 4px solid rgba(${color.r},${color.g},${color.b},.5);"></span>`;
        return `${symbol} ${this.name}`;
      },
    },
	series: [
	  {
		name: 'Tmax',
		type: 'line',
		pointInterval: 24 * 3600 * 1000, // one day
		yAxis: 0,
		color: Highcharts.getOptions().colors[8],//'#FF0000',//Highcharts.getOptions().colors[3], //'#FF0000',
		marker: {
		  symbol: 'circle',
		  radius: 3,
		  fillColor: '#FF0000'//'#FF0000',
		},
		dataLabels: {
          enabled: true,
          style: {
            color: '#FF0000',
            textOutline: 'none',
            fontWeight: 'normal'
          },
		  formatter: function () {
			return Highcharts.numberFormat(this.y,1);
		  }
		},
		tooltip: {
			//valueDecimals: 2,
			valueSuffix: ' °C'
			// pointFormat: 'Value: {point.y:.2f} mm' // Выводит 2 знака после запятой при наведении мыши: Value: 106.40 mm
		}
	  },
	  {
		name: 'Tmin',
		type: 'line',
		pointInterval: 86400000,
		yAxis: 0,
		color: Highcharts.getOptions().colors[4], //'#0000FF', //Highcharts.getOptions().colors[0], //'#0000FF',
		marker: {
		  symbol: 'circle',
		  radius: 3,
		  fillColor: '#0000FF' //'#0000FF',
		},
		dataLabels: {
          enabled: true,
          style: {
            color: '#0000FF',
            textOutline: 'none',
            fontWeight: 'normal',
          },
		  formatter: function () {
			return Highcharts.numberFormat(this.y,1);
		  }
		},
		tooltip: {
          valueSuffix: ' °C',
        }
	  }
	],
	xAxis: {
	  type: 'datetime',
	  dateTimeLabelFormats: { day: '%d.%m' },
	  gridLineWidth: 1,
	  "labels": {
        "formatter": function() {
          return Highcharts.dateFormat("%d.%m %a", this.value)
        }                    
      }
	},
	yAxis: [
	  {
	    title: {
		  text: 'Температура, °C'
	    },
	    alignTicks: false,
        tickInterval: 5,
	  }
	],
	credits: {
	  enabled: false
	},
	plotOptions: {
	  spline: {
		marker: {
		  enable: false
		}
	  }
	},
	legend: {
	  itemStyle: {
	    fontWeight: 'normal'
	  }
    },
	tooltip: {
      xDateFormat: '%d-%m-%Y',
      shared: true,
	  crosshairs: true,
	  //positioner: function () {
      //  return { x: 80, y: 50 };
      //},
      shadow: true,
      borderWidth: 0,
      backgroundColor: 'rgba(255,255,255,0.8)'
    }
  });
}

// Create Weather - Clouds
function create_chart_weather_clouds(renderTo) {
  chartWC = new Highcharts.Chart(renderTo,{	
    chart: {
      type: 'spline',
      inverted: false,
	},
	title: {
	  text: "Погода и облачность",
	  //align: 'left'
	},
	series: [
	  {
		name: 'Облачность',
		type: 'line',
		yAxis: 0,
		pointInterval: 86400000,
		color: Highcharts.getOptions().colors[0],//'#B200FF',
		tooltip: {
            valueSuffix: ' %',
        },
		marker: {
		  symbol: 'circle',
		  radius: 3,
		  fillColor: Highcharts.getOptions().colors[0]//'#B200FF',
		},
		dataLabels: {
          enabled: true,
          style: {
            color: Highcharts.getOptions().colors[1],
            textOutline: 'none',
            fontWeight: 'normal',
          },
		  formatter: function () {
			return Highcharts.numberFormat(this.y,0);
		  }
		}
	  },
	],
	xAxis: {
	  type: 'datetime',
	  dateTimeLabelFormats: { day: '%d.%m' },
	  "labels": {
        "formatter": function() {
          return Highcharts.dateFormat("%d.%m %a", this.value)
        }                    
      },
	  gridLineWidth: 1,
	},
	yAxis: [
	  { 
	    title: {
          text: 'Облачность, %'
        },
		style: {
            color: Highcharts.getOptions().colors[1]
        },
		max: 100,
		min: 0,
		alignTicks: false,
        tickInterval: 20,
      }
	],
	credits: {
	  enabled: false
	},
	plotOptions: {
	  spline: {
		marker: {
		  enable: false
		}
	  }
	},
	legend: {
	  itemStyle: {
	    fontWeight: 'normal'
	  }
    },
	tooltip: {
      xDateFormat: '%d-%m-%Y',
      shared: true,
	  crosshairs: true,
    }
  });
}

// Create Humidity - Pop - Precipitation
function create_chart_humid_pop_precip(renderTo) {
  chartHPP = new Highcharts.Chart(renderTo,{
    title: {
	  text: "Вероятность осадков, количество осадков, влажность",
	  //align: 'left'
	},	  
    chart: {
      type: 'spline',
      inverted: false,
	},
	xAxis: {
	  type: 'datetime',
	  dateTimeLabelFormats: { day: '%d.%m' },
	  "labels": {
        "formatter": function() {
          return Highcharts.dateFormat("%d.%m %a", this.value)
        }                    
      },
	  gridLineWidth: 1,
	},
	yAxis: [
	  { // 1 yAxis
	    title: {
          text: 'Вероятность, влажность, %'
        },
		style: {
            color: Highcharts.getOptions().colors[1]
        },
		max: 100,
		min: 0,
		alignTicks: false,
        tickInterval: 20,
      },
	  { // 2 Primary yAxis
	    title: {
            text: 'Осадки, мм',
            style: {
                color: Highcharts.getOptions().colors[7]
            }
        },
        labels: {
            //format: '{value} mm',
            style: {
                color: Highcharts.getOptions().colors[7]
            }
        },
		min: 0,
		alignTicks: false,
        opposite: true,
		visible: false
      }
	],
	credits: {
	  enabled: false
	},
	plotOptions: {
	  spline: {
		marker: {
		  enable: false
		}
	  },
	  column: {
		stacking: 'normal',  
        pointPlacement: 'on'
      }
	},
	legend: {
	  itemStyle: {
	    fontWeight: 'normal'
	  }
    },
	tooltip: {
      xDateFormat: '%d-%m-%Y',
      shared: true,
	  crosshairs: true,
    },
	series: [
	  {
		name: 'Вероятность осадков',
		type: 'line',
		yAxis: 0,
		pointInterval: 86400000,
		color: Highcharts.getOptions().colors[5],//'#B200FF',
		tooltip: {
            valueSuffix: ' %',
        },
		marker: {
		  symbol: 'circle',
		  radius: 3,
		  fillColor: Highcharts.getOptions().colors[5]//'#B200FF',
		},
		dataLabels: {
          enabled: true,
          //filter: {
          //  operator: '>',
          //  property: 'y',
          //  value: 0
          //},
          style: {
            color: Highcharts.getOptions().colors[5],
            textOutline: 'none',
            fontWeight: 'normal',
          },
		  formatter: function () {
			return Highcharts.numberFormat(this.y,0);
		  }
		}
	  },
	  {
		name: 'Дождь',
		type: 'column', //'column', 'line'
		yAxis: 1,
		pointInterval: 86400000,
		color: Highcharts.getOptions().colors[2],
		stack: 'precipitation',
		tooltip: {
            valueSuffix: ' мм',
			//valueDecimals: 1,
        },
		marker: {
		  symbol: 'circle',
		  radius: 3,
		  color: Highcharts.getOptions().colors[2],
		},
		dataLabels: {
          enabled: true,
          filter: {
            operator: '>',
            property: 'y',
            value: 0
          },
          style: {
            color: 'black',
            textOutline: 'none',
            fontWeight: 'normal',
          },
		  formatter: function () {
			return Highcharts.numberFormat(this.y,1);
		  }
		}
	  },
	  {
		name: 'Снег',
		type: 'column', //'column', 'line'
		yAxis: 1,
		pointInterval: 86400000,
		color: Highcharts.getOptions().colors[4],
		stack: 'precipitation',
		tooltip: {
            valueSuffix: ' мм',
			//valueDecimals: 1,
        },
		marker: {
		  symbol: 'circle',
		  radius: 3,
		  color: Highcharts.getOptions().colors[4],
		},
		dataLabels: {
          enabled: true,
          filter: {
            operator: '>',
            property: 'y',
            value: 0
          },
          style: {
            color: 'black',
            textOutline: 'none',
            fontWeight: 'normal',
          },
		  formatter: function () {
			return Highcharts.numberFormat(this.y,1);
		  }
		}
	  },
	  {
		name: 'Влажность',
		type: 'line',
		yAxis: 0,
		pointInterval: 86400000,
		color: Highcharts.getOptions().colors[0],//'#B200FF',
		tooltip: {
            valueSuffix: ' %',
        },
		marker: {
		  symbol: 'circle',
		  radius: 3,
		  fillColor: Highcharts.getOptions().colors[0]//'#B200FF',
		},
		dataLabels: {
          enabled: true,
          //filter: {
          //  operator: '>',
          //  property: 'y',
          //  value: 0
          //},
          style: {
            color: Highcharts.getOptions().colors[0],
            textOutline: 'none',
            fontWeight: 'normal',
          },
		  formatter: function () {
			return Highcharts.numberFormat(this.y,0);
		  }
		}
	  }
	]
  });
}

// Create Pressure - Wind Chart
function create_chart_press_wind(renderTo) {
  chartPW = new Highcharts.Chart(renderTo,{	
	title: {
	  text: 'Давление, ветер'
	},
	time: {
	  //useUTC: false, //timezone: 'Europe/Helsinki'
	},
	plotOptions: {
	  spline: {
		marker: {
		  enable: false
		}
	  },
	  column: {
        pointPlacement: 'on'
      },
	  windbarb: {
        pointPlacement: 'on'
      }
    },
	legend: {
	  itemStyle: {
	    fontWeight: 'normal'
	  }
    },
	xAxis: {
	  type: 'datetime',
	  dateTimeLabelFormats: { day: '%d.%m' },
	  "labels": {
        "formatter": function() {
          return Highcharts.dateFormat("%d.%m %a", this.value)
        }                    
      },
	  gridLineWidth: 1,
	},
	yAxis: [
	  { // 2 yAxis
	    title: {
          text: 'Скорость ветра, м/с',
          style: {
            color: Highcharts.getOptions().colors[1]
          }
        },
        labels: {
          style: {
            color: Highcharts.getOptions().colors[1]
          }
        },
		//min: 0,
		alignTicks: false,
		visible: true
      },
	  { // 1 yAxis
	    title: {
          text: 'Давление, гПа',
          style: {
            color: Highcharts.getOptions().colors[1]
          }
        },
        labels: {
          //format: '{value}°C',
          style: {
            color: Highcharts.getOptions().colors[1]
          }
        },
		//min: 900,
		alignTicks: false,
        //tickInterval: 15,
		opposite: true,
		visible: false,
      }
	],
	//credits: {
	//  enabled: false
	//},
	tooltip: {
      xDateFormat: '%d-%m-%Y',
      shared: true,
	  crosshairs: true,
    },
	series: [
	  {
		name: 'Давление',
		type: 'line',
		pointInterval: 86400000,
		yAxis: 1,
		tooltip: {
          valueSuffix: ' гПа',
        },
		color: Highcharts.getOptions().colors[6],
		//borderColor: '#000000',
		marker: {
		  symbol: 'circle',
		  radius: 3,
		  fillColor: Highcharts.getOptions().colors[6],
		},
		dataLabels: {
          enabled: true,
          style: {
            color: 'black',
            textOutline: 'none',
            fontWeight: 'normal',
          }
		}
	  },
	  { 
	    name: 'Скорость ветра',
        type: 'line',
		keys: ['y', 'rotation'],
		//yAxis: 1,
        id: 'wind-speed',
        color: '#007F0E',
		pointInterval: 86400000,
		marker: {
		  symbol: 'circle',
		  radius: 3,
		  fillColor: '#007F0E'
		},
        tooltip: {
            valueSuffix: ' м/с',
			valueDecimals: 1,
			pointFormatter: function() {
			  return '<span style="color:' + this.color + '">● </span>' + 'Направление ветра: <b>' + this.rotation + '° (' + windDirLang(this.rotation) + ')</b><br/>'
		  }
        },
		dataLabels: {
          enabled: true,
          style: {
            color: '#007F0E',
            textOutline: 'none',
            fontWeight: 'normal',
          },
		  formatter: function () {
			return Highcharts.numberFormat(this.y,1);
		  }
		}
      },
	  {
		name: 'Направление ветра',
        type: 'windbarb',
		//onSeries: 'wind-speed',
        color: Highcharts.getOptions().colors[1],
		pointInterval: 86400000,
        //showInLegend: false,
		tooltip: {
    	  pointFormatter: function() {
			return '<span style="color:' + this.color + '">● </span>' + 'Скорость ветра: <b>' + Highcharts.numberFormat(this.value, 1) + ' м/с</b> (' + this.beaufort + ')<br/>'
		  }
        },
		dataLabels: {
          enabled: true,
          style: {
            color: Highcharts.getOptions().colors[1],
            textOutline: 'none',
            fontWeight: 'normal',
          }
		}
      }
	]
  });
}