// 02-05-2022 Версия для МК NodeMCU
// 16-02-2023 Данные и LittleFS
var chartT, // 'chart-temperature'
    chartWC, //'div-chart-weather-clouds'
	chartHPP, // 'div-chart-humid-pop-precip'
	chartPW; // 'div-chart-wind-press'
	
function plot_last_forecast(archive) {
  // Из архива всех прогнозов необходимо сформировать запись вида:
  // {"today_utc": 1676538000,"temp_max":[23,23,23,23,23,23,23,23],"temp_min":[12,12,12,23,23,23,23,23],
  //  "pressure"...,"clouds"...,"precipitation"...,"wind_speed"...,"wind_direct"...,"weather_icon_num"...}
  //console.log(archive);
  /* Получаем объект вида (объекты (н.п.) в объекте archive):
  Object { Pisochyn: {…}, Anchorage: {…}, Ushuaia: {…}, Addis_Ababa: {…}, Oymyakon: {…}, McMurdo: {…} }
  ...
    Pisochyn: Object { "temp/min":
​    Anchorage: Object { "temp/min": "1682283600 -4.45 -5.46 -0.72 0.93 2.53 2.63 3.93 4.98", "temp/max": "1682
    Ushuaia: {…}, 
	Addis_Ababa: {…}, 
	Oymyakon: {…}, 
	McMurdo
​  */

  let last_forecast = {};
  
  //console.log("archive:",archive);
  
  var keys = Object.keys(archive['McMurdo']);
  for (var key = 0; key < keys.length; key++){
	var param = archive['McMurdo'][keys[key]];
	console.log(param);
	// param - строка прогноза вида: 1676538000 -4 -3 2 2 0 2 2 4
	const myArray = param.split(" "); // [ "1678093200", "-1.09", "-0.75", "0.41", "6.27", "0.35", "-0.61", "3.14", "1.09" ]
	//console.log("myArray:", myArray);
	last_forecast[keys[key]]=[];
	myArray.forEach((element, index) => {
	  if ((key==0) && (index==0)) last_forecast["today_utc"] = element;
	  let val;
	  if (keys[key]=="McMurdo/forecast/weather/icon") val = element; 
	  else val = Number(element);
      //if ((keys[key]=="precipitation") || (keys[key]=="wind_speed")) val = val/100.;
      if (index>0) last_forecast[keys[key]].push(val);	  
	})
  }
  plotChart(last_forecast);
}

//Plot temperature in the temperature chart
function plotChart(jsonValue) {
  var keys = Object.keys(jsonValue);
  
  // Преобразуем ко времени 00 часов
  var pointStart_curr = parseInt(jsonValue.today_utc/86400)*86400000;
  //console.log("pointStart_curr:",pointStart_curr); // 1649808000000
  var date = new Date(jsonValue.today_utc*1000);
  var day = date.getDate();
  var month = date.getMonth()+1;
  var year = date.getFullYear();
  document.getElementById("forecast_date").textContent = day + '-' + month + '-' + year;
  
  create_chart_temp('div-chart-temperature'); // chartT: 'div-chart-temperature'
  create_chart_weather_clouds('div-chart-weather-clouds'); // chartWC: 'div-chart-weather-clouds'
  create_chart_humid_pop_precip('div-chart-humid-pop-precip'); // chartHPP: 'div-chart-humid-pop-precip'
  create_chart_press_wind('div-chart-wind-press'); // chartWP: 'div-chart-wind-press'
  
  var data = [];
  // 0: 'today_utc', 1: 'temp_max', 2: 'temp_min', 3: 'pressure', 4: 'clouds', 5: 'precipitation',
  // 6: 'wind-speed', 7: 'wind-direct', 8: 'weather_icon_num'
  //for (var key = 1; key < 8; key++){
  for (var key = 0; key < keys.length; key++){
	if (keys[key]=="today_utc") continue;
	if ((keys[key]=="McMurdo/forecast/wind_speed") || (keys[key]=="McMurdo/forecast/wind_deg")) {
	  var param = jsonValue["McMurdo/forecast/wind_speed"]; // wind_speed
	  var param1 = jsonValue["McMurdo/forecast/wind_deg"]; // wind_direct
	} else if (keys[key]=="McMurdo/forecast/clouds") {
	  var param = jsonValue["McMurdo/forecast/clouds"]; // clouds
	  var param1 = jsonValue["McMurdo/forecast/weather/icon"]; // weather_icon_num
	} else {
	  var param = jsonValue[keys[key]];
	}
	param.forEach((element, index) => {
	  if ((keys[key]=="McMurdo/forecast/wind_speed") || (keys[key]=="McMurdo/forecast/wind_deg")) { // ветер: сорость (м/с) и направление
	    data.push([param[index], param1[index]]);
	  }
	  else if (keys[key]=="McMurdo/forecast/clouds") {
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
				
	if (keys[key]=="McMurdo/forecast/temp/max") { // temp_max
	  chartT.series[0].update({
	    pointStart: pointStart_curr,
		data: data //data.data
	  })	
	} else if (keys[key]=="McMurdo/forecast/temp/min") { // temp_min
	  chartT.series[1].update({
		pointStart: pointStart_curr,
		data: data //data.data
	  })	
	} 
	else if (keys[key]=="McMurdo/forecast/pressure") { // pressure
	  chartPW.series[0].update({
		pointStart: pointStart_curr,
		data: data //data.data
	  })
	}
	else if (keys[key]=="McMurdo/forecast/wind_speed") { // McMurdo/forecast/wind_speed
	  chartPW.series[1].update({
		pointStart: pointStart_curr,
		data: data //data.data
	  })
	} else if (keys[key]=="McMurdo/forecast/wind_deg") { // McMurdo/forecast/wind_deg
	  chartPW.series[2].update({
		pointStart: pointStart_curr,
		data: data //data.data
	  })
	}
	else if (keys[key]=="McMurdo/forecast/clouds") { // clouds
	  chartWC.series[0].update({
		pointStart: pointStart_curr,
		data: data //data.data
	  })
	} 
	else if (keys[key]=="McMurdo/forecast/pop") { // McMurdo/forecast/pop
	  chartHPP.series[0].update({
		pointStart: pointStart_curr,
		data: data //data.data
	  })
	}
	else if (keys[key]=="McMurdo/forecast/rain") { // McMurdo/forecast/rain
	  chartHPP.series[1].update({
		pointStart: pointStart_curr,
		data: data //data.data
	  })
	}
	else if (keys[key]=="McMurdo/forecast/snow") { // McMurdo/forecast/snow
	  chartHPP.series[2].update({
		pointStart: pointStart_curr,
		data: data //data.data
	  })
	}
	else if (keys[key]=="McMurdo/forecast/humidity") { // McMurdo/forecast/humidity
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
  chartT = new Highcharts.chart(renderTo,{	
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
  chartWC = new Highcharts.chart(renderTo,{	
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
  chartHPP = new Highcharts.chart(renderTo,{
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
  chartPW = new Highcharts.chart(renderTo,{	
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