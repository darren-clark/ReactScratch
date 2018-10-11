interface GoogleMapsApiProps {
    apiKey: string
}

class GoogleMapsApi extends React.Component<GoogleMapsApiProps> {
    constructor(props: GoogleMapsApiProps) {
        super(props);
        if (GoogleMapsApi.mapsLoading) {
            console.warn("Attempting to load Google Maps API more than once on this page.");
        }
        else {
            GoogleMapsApi.loaded = new Promise<void>((resolve) => {
                GoogleMapsApi.mapsLoading = true;
                GoogleMapsApi.initMaps = () => {
                    resolve();
                }
                var script = document.createElement("script");
                script.src = "https://maps.googleapis.com/maps/api/js?key=" + this.props.apiKey + "&callback=GoogleMapsApi.initMaps";
                script.async = script.defer = true;

                document.body.appendChild(script);
            })
        }
    }
    public static loaded: Promise<any>;
    private static initMaps: () => void;

    private static mapsLoading: boolean = false;

    render() { return null; }
}