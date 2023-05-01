let openweathermap_place;

function draw_map(place) {
  openweathermap_place = place;
}

(async () => {

    const topology = await fetch(
        'https://code.highcharts.com/mapdata/custom/world.topo.json'
    ).then(response => response.json());

    const antarctica = await fetch(
        'https://code.highcharts.com/mapdata/custom/antarctica.topo.json'
    ).then(response => response.json());

    let chart;
	/*
	const openweathermap_place = 
  [ [ 49.9541962, 36.0966085, "Pisochyn", "Песочин, Украина, Харьковская область" ],
	[ 61.217381, -149.863129, "Anchorage", "Анкоридж, США, Аляска" ],
	[ -54.81084, -68.31591, "Ushuaia", "Ушуая, Аргентина, Огненная Земля" ],
	[ 9.005401, 38.763611, "Addis_Ababa", "Аддис-Абеба, Эфиопия" ],
	[ 63.460899, 142.785812, "Oymyakon", "Оймякон, Россия" ],
	[ -77.846, 166.676, "McMurdo", "Станция Мак-Мердо, США" ] ];
	*/
	
	let data = [];
	for (let i=0; i<openweathermap_place.length; i++) {
	  let place1 = openweathermap_place[i];
	  let place_name = place1[3];
	  let myArray = place_name.split(", ");
	  let place_name_short = myArray[0];
	  let place = {};
	  let geometry = {};
	  geometry.type = 'Point';
	  let lon = place1[0];
	  let lat = place1[1];
	  geometry.coordinates = [lat, lon];
	  place.geometry = geometry;
	  place.name = place_name_short + "<br \/>" + place1[2];
	  data.push(place);
	}
		
    const drawMap = projectionKey => {
        if (!chart) {
            chart = Highcharts.mapChart('map-container', {
                chart: {
                    height: '65%'
                },
                title: {
                    text: "Пункты наблюдения"
                },
                legend: {
                    enabled: false
                },
                mapNavigation: {
                    enabled: true,
                    enableDoubleClickZoomTo: true,
                    buttonOptions: {
                        verticalAlign: 'bottom'
                    }
                },
                mapView: {
                    projection: {
                       name: 'Miller',
					   projectedBounds: 'world'
                    }
                },
				plotOptions: {
					 //useHTML: true,
					 series: {
					   dataLabels: {
						 //enabled: true,
						 //allowOverlap: false,
						 //crop: false,
						 //overflow: 'none',
						 align: 'center',
						 //formatter: function() {
						 //},
						 style: {
						   //fontFamily: 'Poppins',
						   //fontWeight: '600',
						   //color: '#373737',
						   fontSize: "12px",
						   //pointerEvents: 'none',
						 }
					   }
					 }
				},
                series: [
				{
                    //data,
                    mapData: topology,
                    joinBy: null,
                    name: 'World',
                    dataLabels: {
                        enabled: false,
                        format: '{point.name}'
                    },
                    clip: false,
					//color: 'tomato',
					borderColor: 'black',
					borderWidth: 0.5,
					nullColor: 'rgba(255, 255, 255, 1.0)',
                },
				{
                    mapData: antarctica,
                    allAreas: true,
                    name: 'Antarctica',
                    clip: false,
                    borderColor: 'black',
					borderWidth: 0.5,
					nullColor: 'rgba(255, 255, 255, 1.0)',
                },
				{
                    type: 'mappoint',
                    data: data,
                    color: '#FF5500'
                }]
            });

        } else {
            chart.update({
                mapView: {
                    projection
                }
            });
        }
    };

    drawMap('miller');
})();