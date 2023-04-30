// 02-05-2022 Версия для МК NodeMCU
// 20-07-2022 Загрузка архива прогнозов на страницу Архив
// 04-04-2023 Построение графиков распределения ошибок прогнозов

//var chartT, // 'chart-temperature'
//    chartClPr; // 'chart-clouds-precipitation'

//import {Chart_title_arr, yAxis_title_arr, param_scale} from "./myconst.js";

var chartEr_err = [];

function plot_err_grath(all_dist, Chart_title_arr, yAxis_title_arr, param_scale) {
  // jsonValue - объект.
  // Key: distribution/temp/min, distribution/temp/max,..., distribution/snow
  // Каждый элемент объекта - массив из 7 значений - по дням прогноза.
  // Каждое значение - строка вида "6 1 0 2 0 0 0 0 0 0 0".
  // Каждое элемент в строке - количество ошибок, находящихся в соответствующем интервале.
  //console.log("plot_err_grath",all_dist);
  
  // Создаем графики
  for (let p_name_num = 0; p_name_num < param_name_str_.length-1; p_name_num++) {
    // Подпись графика параметра
    const Chart_title = Chart_title_arr[p_name_num];
	// Создаем div для графика 
	let div = document.createElement('div');
	let param_name = param_name_str_[p_name_num][0];
	if (param_name_str_[p_name_num].length == 2)
	  param_name += "-" + param_name_str_[p_name_num][1];
	let renderTo = param_name + "-err";
	div.setAttribute("id", renderTo);
	document.getElementById('div_err_grath').appendChild(div);
	
	// Создаем графики распределения ошибок по дням прогноза
	let yAxis_title = yAxis_title_arr[p_name_num];
	create_chart_error_mean(renderTo, Chart_title, yAxis_title);
	// Добавляем к графику серии по числу мест (н.п.)
	for (let place_num=0; place_num<all_dist.length; place_num++) { // цикл по местам (н.п.)
	  let dist = all_dist[place_num];
	  let place_name = dist.place_name;
	  // Делаем короткое название
	  let myArray = place_name.split(",");
	  chartEr_err[p_name_num].addSeries({
        name: myArray[0]
      });
	}
  }
	
  // Добавление данных для графика
  // Цикл по местам (н.п.)
  for (let place_num=0; place_num<all_dist.length; place_num++) { // цикл по местам (н.п.)
	let dist = all_dist[place_num];
	let place_name = dist.place_name;
	for (let p_name_num = 0; p_name_num < param_name_str_.length-1; p_name_num++) {
	  let param_name = param_name_str_[p_name_num][0];
	  if (param_name_str_[p_name_num].length == 2)
	    param_name += "/" + param_name_str_[p_name_num][1];
	  var param = dist[param_name];

	  // Вычисляем средние значения ошибок
      let data_err = [];
	  for (let j=0; j<7; j++) {
	    // Берем строку
	    let str1 = param[j];
	    // Превращаем её в числовой массив
        let myArray = str1.split(" ").map(Number);
	    // Находим сумму элементов и сумму ошибок
	    let sum_el = 0;
	    let sum_err = 0;
	    for (let k=0; k<myArray.length; k++) {
		  sum_el += myArray[k];
       	  sum_err	+= myArray[k]*k*param_scale[p_name_num];
	    }
	    let mean_error = (sum_err/sum_el).toFixed(1); // округляем до первого знака
		console.log(mean_error);
	    data_err.push(mean_error);
	  }
	  chartEr_err[p_name_num].series[place_num].setData(data_err);
    } // for (let p_name_num = 0; p_name_num < param_name_str_.length-1; p_name_num++) {
  } // for (let i=0; i<all_dist.length-1; i++) { // цикл по местам (н.п.)
}

function create_chart_error_mean(renderTo, Chart_title, yAxis_title) {
  let chart = new Highcharts.chart(renderTo,{
    chart: {
      type: 'line',
      width: 500,
      height: 300
    },	  
	title: {
	  text: Chart_title,
	  style: {
        fontWeight: 'bold'
      }
	},
    plotOptions: {
      series: {
        //pointWidth: 5,
		pointPadding: 0,
        groupPadding: 0.1,
        borderWidth: 0,
        shadow: false
      }
    },
	xAxis: {
		categories: ['1', '2', '3', '4', '5', '6', '7'],
        labels: {
            align: 'center' // выравнивание подписей под серединой столбцов
        },
		title: {
          text: 'Дней',
          style: {
            color: Highcharts.getOptions().colors[1]
          }
        },
	    gridLineWidth: 1,
    },
	yAxis: [
	  { 
	    title: {
          text: yAxis_title,
          style: {
            color: Highcharts.getOptions().colors[1]
          }
        },
        labels: {
          style: {
            color: Highcharts.getOptions().colors[1]
          }
        },
		alignTicks: true,
      }
	 ],
	credits: {
	  enabled: false
	},
	legend: {
	  //enabled: false,
	  itemStyle: {
	    fontWeight: 'normal'
	  }
    },
	tooltip: {
      //xDateFormat: '%d-%m-%Y',
      shared: true,
	  crosshairs: true,
	  shadow: true,
      borderWidth: 0,
      backgroundColor: 'rgba(255,255,255,0.8)'
    }
  });
  chartEr_err.push(chart);
}