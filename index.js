// index.js 23-04-2023

  import { plot_dist_grath } from "./js/plot_dist_grath.js";
	
	    var firebaseConfig = {
	      //apiKey: "AIzaSyDZCBYYnoI8O9rWW_V9PhksdRppDWfSG4o", 
	      //databaseURL: "https://probe-23-02-2023-default-rtdb.europe-west1.firebasedatabase.app"
		  databaseURL: "https://probe-web-default-rtdb.europe-west1.firebasedatabase.app",
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
	  const all_last_forecasts = new Object();
	  const all_forecasts = new Object();
	  const all_dist = new Object();
	  
	  async function get_last_forecasts() {
	    for (var part_name_no=0; part_name_no < path_name.length; part_name_no++) {
	      var path = "forec_gh/forecast/" + path_name[part_name_no];
		  await get_last_forecast_param (path).then ((value) => {
		    //console.log(path, value[value.length-1]);
			// Здесь вызывать функцию построения графика параметра
			all_forecasts[path] = value; // value.length-1
			all_last_forecasts[path] = value[0]; // value.length-1
			//console.log(path, all_last_forecasts[path]);
		  })
	    }
	  }
	   
	  async function prepare_last_forecasts() {
	    await get_last_forecasts().then (() => {
		  //console.log(all_last_forecasts);
		  //console.log("Передаем для построения графиков");
		  plot_last_forecast(all_last_forecasts); // Выводим последний прогноз
		  plot_all_forecasts(all_forecasts); // Строим таблицы всех прогнозов
		})
	  }
	  
	  // При открытии страницы 'statistics_graph_tab'
	  async function prepare_dist() {
	    await get_dist().then (() => {
		  //console.log(all_last_forecasts);
		  //console.log("Передаем для построения графиков");
		  plot_dist_grath(all_dist); // Выводим графики распределений
		  plot_dist_tab(all_dist); // Строим таблицы всех распределений ошибок
		  plot_err_grath(all_dist); // Выводим графики средних абсолютных ошибок
		})
	  }
	  
	  async function get_dist() {
	    for (var part_name_no=0; part_name_no < path_name.length-1; part_name_no++) {
	      var path = "forec_gh/distrib/" + path_name[part_name_no];
		  await get_dist_param (path).then ((value) => {
		    //console.log(path, value[value.length-1]);
			// Здесь вызывать функцию построения графика параметра
			all_dist[path] = value; // value.length-1
			//console.log(path, all_dist[path]);
		  })
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
			prepare_last_forecasts();
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
	  
	  //document.getElementById("defaultOpen").click(); // Открываем 1-ю закладку