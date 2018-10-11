interface GoogleMapProps extends React.Props<any> {
    apiKey: string;
    center: google.maps.LatLng | google.maps.LatLngLiteral
    zoom: number;
    mapTypeId?: google.maps.MapTypeId;
    styles?: google.maps.MapTypeStyle[];
    toggleClouds: () => void;
    toggleWeather: () => void;
    closeMap: () => void;
}

interface GoogleMapsState {
    bounds: google.maps.LatLngBounds;
    width: number;
    height: number;    
}

class GoogleMap extends React.Component<GoogleMapProps, GoogleMapsState> {
    private static pendingInits: (() => void)[] = [];
    private static mapsLoading: boolean = false;
    private static mapsLoaded: boolean = false;

    private static loadMaps(apiKey: string, init: () => void) {
        if (this.mapsLoaded) {
            init();
        }
        else {
            this.pendingInits.push(init);
            if (!this.mapsLoading) {
                this.mapsLoading = true;
                var script = document.createElement("script");
                script.src = "https://maps.googleapis.com/maps/api/js?key=" + apiKey + "&callback=GoogleMap.initMaps";
                script.async = script.defer = true;

                document.body.appendChild(script);
            }
        }
    }

    public static initMaps() {
        this.mapsLoaded = true;
        this.pendingInits.forEach(i => i());
        delete this.pendingInits;
    }

    private mapRef = React.createRef<HTMLDivElement>();
    private map: google.maps.Map;

    constructor(props) {
        super(props);
    }

    public componentDidMount() {
        GoogleMap.loadMaps(this.props.apiKey, () => this.init());
    }

    shouldComponentUpdate(nextProps: GoogleMapProps, nextState: GoogleMapsState, nextContext) {
//        var pureshould = super.shouldComponentUpdate(nextProps, nextState, nextContext);
        return true;
    }

    public render() {
        return (
            <div>
                <div ref={this.mapRef} className="google-map">  
                </div>
                {this.renderChildren()}
            </div>
        )
    }

    private renderChildren() {

        const { children } = this.props;

        if (!children) return;
        return React.Children.map(children, c => {
            if (!c) return;
            return React.cloneElement(c as React.ReactElement<any>, {
                map: this.map,
                ...this.state
            });
        });
    }

    private init() {
        const {
            apiKey,
            children,
            key,
            ref,
            toggleClouds,
            toggleWeather,
            closeMap,
            ...props
        } = this.props;

        this.map = new google.maps.Map(this.mapRef.current, {
            ...props,
            styles: mapStyle
        });

        // create the close control
        var closeControlDiv = document.createElement('div');
        var closeControl = this.closeControl(closeControlDiv, closeMap);
        this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(closeControlDiv);

        // create the weather control
        var weatherControlDiv = document.createElement('div');
        var weatherControl = this.weatherControl(weatherControlDiv, toggleWeather);
        this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(weatherControlDiv);

        // create the cloud control
        var cloudControlDiv = document.createElement('div');
        var cloudControl = this.cloudControl(cloudControlDiv, toggleClouds);
        this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(cloudControlDiv);

        google.maps.event.addListener(this.map, 'dragend', () => this.mapUpdated());
        google.maps.event.addListener(this.map, 'zoom_changed',() => this.mapUpdated());
        google.maps.event.addListenerOnce(this.map, 'tilesloaded',() => this.mapUpdated());
    }

    private closeControl(controlDiv, closeMap) {
        var controlUI = this.createControlUI('Close Map');
        controlUI.style.marginRight = '10px';
        controlDiv.appendChild(controlUI);

        var controlText = this.createControlText('<i class="fa fa-times"></i>');
        controlUI.appendChild(controlText);
                
        // Setup the click event listeners: simply set the map to Chicago.
        controlUI.addEventListener('click', function () {
            closeMap()
        });
    }

    private weatherControl(controlDiv, toggleWeather) {
        var controlUI = this.createControlUI('Toggle Weather on/off');
        controlDiv.appendChild(controlUI);

        var controlText = this.createControlText('<i class="fa fa-bolt"></i> Weather');
        controlUI.appendChild(controlText);

        /*
        // Set CSS for the control border.
        var controlUI = document.createElement('div');
        controlUI.style.backgroundColor = '#fff';
        controlUI.style.marginTop = '10px';
        controlUI.style.height = '40px';     
        controlUI.style.borderRadius = '2px';
        controlUI.style.boxShadow = 'rgba(0, 0, 0, 0.3) 0px 1px 4px -1px';
        controlUI.style.cursor = 'pointer';
        controlUI.style.marginBottom = '10px';
        controlUI.style.textAlign = 'right';
        controlUI.title = 'Toggle Weather on/off';
        controlDiv.appendChild(controlUI);

        // Set CSS for the control interior.
        var controlText = document.createElement('div');
        controlText.style.color = 'rgb(25,25,25)';
        controlText.style.fontFamily = 'Roboto, Arial, sans-serif';
        controlText.style.fontSize = '18px';
        controlText.style.fontWeight = '500';
        controlText.style.lineHeight = '38px';
        controlText.style.paddingTop = '2px';
        controlText.style.paddingLeft = '10px';
        controlText.style.paddingRight = '10px';
        controlText.innerHTML = '<i class="fa fa-bolt"></i> Weather';
        controlUI.appendChild(controlText);
        */

        // Setup the click event listeners: simply set the map to Chicago.
        controlUI.addEventListener('click', function () {
            toggleWeather()
        });
    }

    private cloudControl(controlDiv, toggleClouds) {
        var controlUI = this.createControlUI('Toggle Clouds on/off');
        controlDiv.appendChild(controlUI);

        var controlText = this.createControlText('<i class="fa fa-cloud"></i> Clouds');
        controlUI.appendChild(controlText);

        // Setup the click event listeners: simply set the map to Chicago.
        controlUI.addEventListener('click', function () {
            toggleClouds()
        });
    }

    // create control text
    private createControlText(html) {
        // Set CSS for the control interior.
        var controlText = document.createElement('div');
        controlText.style.color = 'rgb(0,0,0)';
        controlText.style.fontFamily = 'Roboto, Arial, sans-serif';
        controlText.style.fontSize = '18px';
        controlText.style.fontWeight = '500';
        controlText.style.lineHeight = '38px';
        controlText.style.paddingTop = '2px';
        controlText.style.paddingLeft = '10px';
        controlText.style.paddingRight = '10px';
        controlText.innerHTML = html;
        return controlText;
    }

    // create control ui div
    private createControlUI(title) {
        // Set CSS for the control border.
        var controlUI = document.createElement('div');
        controlUI.style.backgroundColor = '#fff';
        controlUI.style.marginTop = '10px';
        controlUI.style.marginLeft = '10px';
        controlUI.style.height = '40px';
        controlUI.style.borderRadius = '2px';
        controlUI.style.boxShadow = 'rgba(0, 0, 0, 0.3) 0px 1px 4px -1px';
        controlUI.style.cursor = 'pointer';
        controlUI.style.marginBottom = '10px';
        controlUI.style.textAlign = 'right';
        controlUI.title = title;
        return controlUI;
    }


    private mapUpdated() {
        let bounds = this.map.getBounds();
        let div = this.map.getDiv();
        let width = div.clientWidth;
        let height = div.clientHeight;
        this.setState({ bounds, width, height });
    }
}

const mapStyle: google.maps.MapTypeStyle[] = [
    {
        "featureType": "all",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#55554f"
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "gamma": 0.01
            },
            {
                "lightness": 20
            },
            {
                "saturation": 19
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "saturation": -31
            },
            {
                "lightness": -33
            },
            {
                "weight": 2
            },
            {
                "gamma": 0.8
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "administrative.country",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "administrative.province",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "administrative.locality",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "simplified"
            },
            {
                "color": "#ffffff"
            }
        ]
    },
    {
        "featureType": "administrative.neighborhood",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "administrative.land_parcel",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#ff9500"
            },
            {
                "lightness": 48
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "geometry",
        "stylers": [
            {
                "lightness": 30
            },
            {
                "saturation": 30
            },
            {
                "color": "#55554f"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "labels",
        "stylers": [
            {
                "hue": "#ff0000"
            }
        ]
    },
    {
        "featureType": "landscape.man_made",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "landscape.natural",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "landscape.natural.landcover",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "landscape.natural.terrain",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
            {
                "saturation": 20
            }
        ]
    },
    {
        "featureType": "poi.attraction",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.attraction",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.business",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.government",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [
            {
                "lightness": 20
            },
            {
                "saturation": -20
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "all",
        "stylers": [
            {
                "color": "#252834"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
            {
                "lightness": 10
            },
            {
                "saturation": -30
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "saturation": 25
            },
            {
                "lightness": 25
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "lightness": -20
            },
            {
                "color": "#252834"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    }
]