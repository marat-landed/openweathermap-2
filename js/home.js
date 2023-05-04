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
	
	let map_point = [];
	for (let i=0; i<openweathermap_place.length; i++) {
	  let place1 = openweathermap_place[i];
	  let place = {};
	  place.full_name = place1[3]
	  let myArray = place1[3].split(", ");
	  place.name = myArray[0];
	  place.lat = place1[0];
	  place.lon = place1[1];
	  map_point.push(place);
	}
		
    const drawMap = () => {
        if (!chart) {
            chart = Highcharts.mapChart('map-container', {
                chart: {
                    height: '100%',
					backgroundColor: 'rgba(20,20,20,0.3)',
					plotBackgroundColor: '#4b96af'
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
				mapNavigation: {
					enabled: true,
					buttonOptions: {
						verticalAlign: 'top'
					}
				},
				tooltip: {
					useHTML: true,
					headerFormat: '<span class="tooltipHeader">{point.key}</span>',
					pointFormat: '<br/> <div class="tooltipPointWrapper">‎'
					+
					'<span class="tooltipPoint">{point.full_name}</span>'
					+
					'<span class="tooltipLine"></span> <br/>'
					+
					'<span style="color:{point.color2}">Ш: {point.lat} Д: {point.lon}</span>',
					style: {
					  color: '#000'
					},
					valueDecimals: 1,
					backgroundColor: '#F8FF99',
					borderColor: '#808080',
					borderRadius: 6,
					borderWidth: 2,
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
						   fontFamily: 'Arial',
						   fontWeight: 'normal',
						   //color: '#373737',
						   fontSize: "13px",
						   //pointerEvents: 'none',
						 }
					   }
					},
					mappoint: {
						keys: ['id', 'lat', 'lon', 'name', 'y'],
						marker: {
							//lineWidth: 1,
							//lineColor: '#000',
							//symbol: 'mapmarker',
							//radius: 8
						},
						dataLabels: {
							//enabled: false
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
					borderWidth: 0.2,
					nullColor: 'rgba(255, 255, 255, 1.0)',
                },
				{
                    mapData: antarctica,
                    allAreas: true,
                    name: 'Antarctica',
                    clip: false,
                    borderColor: 'black',
					borderWidth: 0.2,
					nullColor: 'rgba(255, 255, 255, 1.0)',
                },
				{
                    type: 'mappoint',
                    data: map_point,
                    color: '#FF5500',
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

    //drawMap('miller');
	drawMap();
})();