function getCurrentLocation() {

    return new Promise((resolve, reject) => {

        if (!navigator.geolocation) {
            reject(new Error("GEOLOCATION_NOT_SUPPORTED"));
            return;
        }

        navigator.geolocation.getCurrentPosition(

            position => {

                resolve({
                    latitude:
                        position.coords.latitude,

                    longitude:
                        position.coords.longitude,

                    accuracy:
                        position.coords.accuracy,

                    createdAt:
                        Date.now()
                });

            },

            error => {
                reject(error);
            },

            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );

    });

}