package com.illumio.benfinder160;

import android.Manifest;
import android.annotation.SuppressLint;
import android.content.Context;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.support.annotation.NonNull;
import android.support.v4.app.ActivityCompat;
import android.support.v4.app.FragmentActivity;
import android.os.Bundle;
import android.util.Log;

import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.BitmapDescriptorFactory;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.Marker;
import com.google.android.gms.maps.model.MarkerOptions;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;

import java.util.Arrays;

public class MapsActivity extends FragmentActivity implements OnMapReadyCallback {

    private static final int FINE_REQUEST = 1;
    private static final int COARSE_REQUEST = 2;

    private static final String TAG = "MapsActivity";
    private GoogleMap mMap;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_maps);
        // Obtain the SupportMapFragment and get notified when the map is ready to be used.
        SupportMapFragment mapFragment = (SupportMapFragment) getSupportFragmentManager()
                .findFragmentById(R.id.map);
        mapFragment.getMapAsync(this);
    }

    /**
     * Manipulates the map once available.
     * This callback is triggered when the map is ready to be used.
     * This is where we can add markers or lines, add listeners or move the camera. In this case,
     * we just add a marker near Sydney, Australia.
     * If Google Play services is not installed on the device, the user will be prompted to install
     * it inside the SupportMapFragment. This method will only be triggered once the user has
     * installed Google Play services and returned to the app.
     */
    @Override
    public void onMapReady(GoogleMap googleMap) {
        mMap = googleMap;

        // Request the user's (Ben's) location
        // Display that on the map

        Log.d(TAG, "Requesting location...");

        // Register the listener with the Location Manager to receive location updates
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            Log.d(TAG, "Needs permish");

            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.ACCESS_FINE_LOCATION}, FINE_REQUEST);
        } else {
            startListening();
        }
    }

    @SuppressLint("MissingPermission")
    private void startListening() {
        // Acquire a reference to the system Location Manager
        LocationManager locationManager = (LocationManager) this.getSystemService(Context.LOCATION_SERVICE);

        // Define a listener that responds to location updates
        LocationListener gpsListener = new LocationListener() {
            public void onLocationChanged(Location location) {
                // Called when a new location is found by the wifiwork location provider.
                Log.d(TAG, "New location");

                makeUseOfGpsLocation(location);
            }

            public void onStatusChanged(String provider, int status, Bundle extras) {
            }

            public void onProviderEnabled(String provider) {
            }

            public void onProviderDisabled(String provider) {
            }
        };

        LocationListener wifiworkListener = new LocationListener() {
            public void onLocationChanged(Location location) {
                // Called when a new location is found by the wifiwork location provider.
                Log.d(TAG, "New wifiwork location");

                makeUseOfWifiLocation(location);
            }

            public void onStatusChanged(String provider, int status, Bundle extras) {
            }

            public void onProviderEnabled(String provider) {
            }

            public void onProviderDisabled(String provider) {
            }
        };

        assert locationManager != null;
        locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 0, 0, gpsListener);
        locationManager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 0, 0, wifiworkListener);

    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        switch (requestCode) {
            case COARSE_REQUEST:
                Log.d(TAG, Arrays.toString(grantResults));

                if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
                    ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.ACCESS_FINE_LOCATION}, FINE_REQUEST);
                } else if (grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    startListening();
                }
                break;
            case FINE_REQUEST:
                Log.d(TAG, Arrays.toString(grantResults));

                if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
                    ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.ACCESS_COARSE_LOCATION}, COARSE_REQUEST);
                } else if (grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    startListening();
                }
                break;
        }
    }

    Marker gpsMarker, wifiMarker;

    private void makeUseOfGpsLocation(Location location) {
        LatLng ben = new LatLng(location.getLatitude(), location.getLongitude());
        if (gpsMarker != null) gpsMarker.remove();
        gpsMarker = mMap.addMarker(new MarkerOptions().position(ben).title("Ben"));
        mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(ben, 21f));

        // Save to Firebase every new location? TODO Too spammy?
        // Write a message to the database
        FirebaseDatabase database = FirebaseDatabase.getInstance();
        DatabaseReference latRef = database.getReference("gpsLocation/lat");
        DatabaseReference longRef = database.getReference("gpsLocation/long");

        latRef.setValue(location.getLatitude());
        longRef.setValue(location.getLongitude());
    }

    private void makeUseOfWifiLocation(Location location) {
        LatLng ben = new LatLng(location.getLatitude(), location.getLongitude());
        if (wifiMarker != null) wifiMarker.remove();
        wifiMarker = mMap.addMarker(new MarkerOptions().position(ben).title("Ben").icon(BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_AZURE)));

        // Save to Firebase every new location? TODO Too spammy?
        // Write a message to the database
        FirebaseDatabase database = FirebaseDatabase.getInstance();
        DatabaseReference latRef = database.getReference("wifiLocation/lat");
        DatabaseReference longRef = database.getReference("wifiLocation/long");

        latRef.setValue(location.getLatitude());
        longRef.setValue(location.getLongitude());
    }
}
