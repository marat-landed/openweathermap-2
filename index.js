// index.js 23-04-2023

//import { plot_dist_grath } from "./js/plot_dist_grath.js";
//import { plot_dist_tab } from "./js/plot_dist_tab.js";
import { plot_err_grath } from "./js/plot_err_grath.js";
//import { plot_all_forecasts } from "./js/plot_all_forecasts.js";
import { database_URL, openweathermap_place, Chart_title_arr, param_name_str, param_scale } from "./js/myconst.js";
	
	    const firebaseConfig = {
	      //apiKey: "AIzaSyDZCBYYnoI8O9rWW_V9PhksdRppDWfSG4o", 
	      databaseURL: database_URL //"https://probe-web-default-rtdb.europe-west1.firebasedatabase.app",
        };
	  
      // Initialize Firebase
      firebase.initializeApp(firebaseConfig);
	  
	  // Получение последнего прогноза одного параметра по заданному пути path
	  async function get_last_forecast_param (path) {
	    const dbRef = firebase.database().ref(path);
	    var forecast = await dbRef.once('value').then((snapshot) => {
		  if (snapshot.exists()) {
		    return snapshot.val();
		  } else ;
	    });
		return forecast;
	  }
	  
	  const path_name = ["temp/min", "temp/max", "pressure", "humidity", "wind_speed",
	    "wind_deg", "clouds", "pop", "rain", "snow", "weather/icon"];
	  const all_last_forecasts = [];
	  const all_forecasts = [];
	  const all_dist = [];
	  
	  async function get_last_forecasts() {
		for (let i=0; i<openweathermap_place.length; i++) {
		  let path0 = openweathermap_place[i][2];
		  
		  let last_forecasts = {};
		  last_forecasts.place_name = openweathermap_place[i][3];
		  all_last_forecasts.push(last_forecasts);
		  
		  let forecasts = {};
		  forecasts.place_name = openweathermap_place[i][3];
		  all_forecasts.push(forecasts);
		  
		  for (let part_name_no=0; part_name_no < path_name.length; part_name_no++) {
			let param_name = path_name[part_name_no];
	        let path = path0 + "/forecast/" + param_name;
		    await get_last_forecast_param (path).then ((value) => {
		      //console.log(path, value[value.length-1]);
			  // Здесь вызывать функцию построения графика параметра
			  //console.log(path0);
			  forecasts[param_name] = value; // value.length-1
			  last_forecasts[param_name] = value[0]; // value.length-1
			  //console.log(path, all_last_forecasts);
		    })
	      }
		}
	  }
	   
	  async function prepare_plot_forecasts() {
	    await get_last_forecasts().then (() => {
		  //console.log(all_last_forecasts);
		  //console.log("Передаем для построения графиков");
		  plot_last_forecast(all_last_forecasts, openweathermap_place); // Выводим последний прогноз
		  plot_all_forecasts(all_forecasts, Chart_title_arr, openweathermap_place, param_name_str); // Строим таблицы всех прогнозов
		})
	  }
	  
	  // При открытии страницы 'statistics_graph_tab'
	  async function prepare_dist() {
	    await get_dist().then (() => {
		  //console.log(all_last_forecasts);
		  //console.log("Передаем для построения графиков");
		  plot_dist_grath(all_dist, openweathermap_place, Chart_title_arr, param_name_str, param_scale); // Выводим графики распределений
		  plot_dist_tab(all_dist, Chart_title_arr, openweathermap_place, param_name_str); // Строим таблицы всех распределений ошибок
		  //plot_err_grath(all_dist); // Выводим графики средних абсолютных ошибок
		})
	  }
	  
	  async function get_dist() {
		for (let i=0; i<openweathermap_place.length; i++) {
		  let path0 = openweathermap_place[i][2];
		  let dist = {};
		  dist.place_name = openweathermap_place[i][3];
		  all_dist.push(dist);
	      for (var part_name_no=0; part_name_no < path_name.length-1; part_name_no++) {
	        var path = path0 + "/distrib/" + path_name[part_name_no];
			let param_name = path_name[part_name_no];
		    await get_dist_param (path).then ((value) => {
		      //console.log(path, value[value.length-1]);
			  // Здесь вызывать функцию построения графика параметра
			  dist[param_name] = value; // value.length-1
			  //console.log(path, all_dist[path]);
		    })
	      }
		}
	  }
	  
	  // Получение последнего распределения одного параметра по заданному пути path
	  async function get_dist_param (path) {
	    var dist = await firebase.database().ref(path).once('value').then((snapshot) => {
		  if (snapshot.exists()) {
		    return snapshot.val();
		  } else ;
	    });
		return dist;
	  }
	
	  function openTab(evt, tabName) {
		var i, tabcontent, tablinks;
		tabcontent = document.getElementsByClassName("tabcontent");
		for (i = 0; i < tabcontent.length; i++) {
		  tabcontent[i].style.display = "none";
		}
		tablinks = document.getElementsByClassName("tablinks");
		for (i = 0; i < tablinks.length; i++) {
		  tablinks[i].className = tablinks[i].className.replace(" active", "");
		}
		document.getElementById(tabName).style.display = "block";
		evt.currentTarget.className += " active";
	  }
	  
	  function load_page(page_name) {
		var xhr= new XMLHttpRequest();
	    xhr.open('GET', 'pages/' + page_name, true);
	    xhr.onreadystatechange= function() {
		  if (this.readyState!==4) return;
		  if (this.status!==200) return; // or whatever error handling you want
		  document.getElementById(page_name).innerHTML= this.responseText;
		  if (page_name == 'forecasts') {
		    // Подготовка последних прогнозов и передача их для построения графиков
			prepare_plot_forecasts();
		  } else if (page_name == 'statistics_graph') {
		    // Статистика прогнозов графики
			prepare_dist();
		  } else if (page_name == 'site_traffic') {
		    var script = document.createElement('script');
			//script.src = "https://rf.revolvermaps.com/0/0/7.js?i=5sr5di4zdid&amp;m=0&amp;c=ff0000&amp;cr1=ffffff&amp;sx=0";
			script.src = "//rf.revolvermaps.com/0/0/7.js?i=5sr5di4zdid&amp;m=0&amp;c=ff0000&amp;cr1=ffffff&amp;sx=0";
			script.async = true; // false - чтобы гарантировать порядок
			//document.head.appendChild(script);
			document.getElementById("Revolvermaps").appendChild(script);
		  }
	    };
	    xhr.send();
	  }
	
	  load_page('home');
	  load_page('forecasts');
	  load_page('mean_error');
	  load_page('archive_tab');
	  load_page('statistics_graph');
	  load_page('statistics_tab');
	  load_page('about');
	  load_page('site_traffic');
	  
  let elements = document.querySelectorAll(".tablinks");
  for (let i = 0; i < elements.length; i++) {
    //elements[i].onclick = function(evt, tabName){
	elements[i].onclick = function(event){
      let tabcontent, tablinks;
	  let tabName = event.target.name;
	  tabcontent = document.getElementsByClassName("tabcontent");
	  for (let i = 0; i < tabcontent.length; i++) {
		tabcontent[i].style.display = "none";
	  }
	  tablinks = document.getElementsByClassName("tablinks");
	  for (let i = 0; i < tablinks.length; i++) {
		tablinks[i].className = tablinks[i].className.replace(" active", "");
	  }
	  document.getElementById(tabName).style.display = "block";
	  elements[i].style.display = "block";
	  event.currentTarget.className += " active";
    };
  }      
	  
  document.getElementById("defaultOpen").click(); // Открываем 1-ю закладку