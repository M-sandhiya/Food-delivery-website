package com.excelr.FoodDelivery.Models.DTO;

import com.excelr.FoodDelivery.Models.Address;
import com.excelr.FoodDelivery.Models.Customer;
import com.excelr.FoodDelivery.Models.Restaurant;
import com.excelr.FoodDelivery.Models.Enum.AddressOwnerType;
import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AddressDTO {

	private Long id;
	private String fulladdress;
    private String street;
    private String city;
    private String state;
    private String pincode;
    private String country;
    private String AddressName;
    private String landmark;
    private Double latitude;
    private Double longitude;
    private Boolean isActive;
    private Boolean defaultAddress;
    private AddressOwnerType ownerType;
    
    public AddressDTO(Address a) {
        if (a == null) {
            this.id = null;
            this.fulladdress = null;
            this.street = null;
            this.city = null;
            this.state = null;
            this.pincode = null;
            this.country = null;
            this.landmark = null;
            this.latitude = null;
            this.longitude = null;
            this.ownerType = null;
            this.AddressName = null;
            this.isActive = null;
            this.defaultAddress = null;
        } else {
            this.id = a.getId();
            this.fulladdress = a.getFulladdress();
            this.street = a.getStreet();
            this.city = a.getCity();
            this.state = a.getState();
            this.pincode = a.getPincode();
            this.country = a.getCountry();
            this.landmark = a.getLandmark();
            this.latitude = a.getLatitude();
            this.longitude = a.getLongitude();
            this.ownerType = a.getOwnerType();
            this.AddressName = a.getAddressName();
            this.isActive = a.getIsActive();
            this.defaultAddress = a.getDefaultAddress();
        }
    }
}
