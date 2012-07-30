(function($) {
    $.widget("ui.ContactManager", {
        options: { 
            tabs: {
                search: {
                    label: "Search Voters"
                },
                contact: {
                    label: "Contacts"
                }
            },
            ajaxWait: $('<div />')
                .addClass('ui-state-default ui-widget-content')
                .append(
                    $('<p />')
                    .css({
                        "text-align": "center",
                        "margin-top": "0px",
                        "margin-bottom": "0px",
                        "padding": "0px"
                    })
                    .append(
                        $('<img />',{
                            "id": "waitImage",
                            "alt": "Wait Image",
                            "src": "img/ajax-loader.gif"
                        })
                    )
                ),
            contactVoterInfo: {
                fields: {
                    fnx: {
                        currentContact: {
                            input: $('<select />'),
                            label: "Select Contact"
                        },
                        contactType: {
                            input: $('<select />')
                                .append(
                                    $('<option />').html('All').val('')
                                ),
                            label: "Select Contact Type"                            
                        },
                        contactButton: {
                            input: $('<button />').button({
                                text: true,
                                label: "Create",
                                disabled: false
                            }),
                            label: "Create New Contact"
                        }
                    }
                },
                info: {
                    bio: {
                        name: {
                            input: $('<span />'),
                            label: "Name"
                        },
                        address: {
                            input: $('<select />'),
                            label: "Address"
                        },
                        telephone: {
                            input: $('<span />'),
                            label: "Telephone"
                        }                        
                    },
                    registration: {
                        party: {
                            input: $('<span />'),
                            label: "Party"
                        },
                        primaryCount: {
                            input: $('<span />'),
                            label: "Primary Election Vote Count"
                        },
                        generalCount: {
                            input: $('<span />'),
                            label: "General Election Vote Count"
                        }
                    },
                    demographic: {
                        race: {
                            input: $('<span />'),
                            label: "Race"
                        },
                        gender: {
                            input: $('<span />'),
                            label: "Gender"
                        },
                        birthday: {
                            input: $('<span />'),
                            label: "Birthday"
                        }
                    }
                }
            },
            searchResults: {
                searchResultTable: $('<table />')                
            },
            searchFields: {
                searchNameTable: $('<table />'),
                searchLocationTable: $('<table />'),
                searchRegistrationTable: $('<table />'),
                searchButton: $('<button />').button({
                    text: true,
                    label: "Find Matching Voters",
                    disabled: false
                }),
                searchFieldset: $('<fieldset />')
                    .addClass('ui-widget-content')
                    .append(
                        $('<legend />')
                        .html('Search Elements')
                        .addClass('ui-state-default ui-widget-header ui-corner-all')
                    ),
                name: {
                    firstName: {
                        input: $('<input />'),
                        label: "First Name"
                    },
                    middleName: {
                        input: $('<input />'),
                        label: "Middle Name"
                    },
                    lastName: {
                        input: $('<input />'),
                        label: "Last Name"                    
                    },
                    gender: {
                        input: $('<select />'),
                        label: "Gender"
                    },
                    race: {
                        input: $('<select />'),
                        label: "Race"
                    }
                },
                location: {
                    county: {
                        input: $('<select />'),
                        label: "County Name"
                    },
                    address: {
                        input: $('<input />'),
                        label: "Address"                        
                    },
                    city: {
                        input: $('<input />'),
                        label: "City"
                    },
                    zip: {
                        input: $('<input />'),
                        label: "Zip Code"
                    }
                },
                registration: {
                    party: {
                        input: $('<select />'),
                        label: "Registered Party"                        
                    },
                    status: {
                        input: $('<select />'),
                        label: "Registered Status"                        
                    },
                    congressionalDistrict: {
                        input: $('<input />'),
                        label: "Congressional District"
                    },
                    houseDistrict: {
                        input: $('<input />'),
                        label: "House District"
                    },
                    senateDistrict: {
                        input: $('<input />'),
                        label: "Senate District"
                    },
                    countyCommissionDistrict: {
                        input: $('<input />'),
                        label: "County Commission District"
                    },
                    schoolBoardDistrict: {
                        input: $('<input />'),
                        label: "School Board District"
                    },
                    precinct: {
                        input: $('<input />'),
                        label: "Precinct"
                    },
                    precinctGroup: {
                        input: $('<input />'),
                        label: "Precinct Group"
                    },
                    precinctSplit: {
                        input: $('<input />'),
                        label: "Precinct Split"
                    },
                    precinctSuffix: {
                        input: $('<input />'),
                        label: "Precinct Suffix"
                    }
                }
            }
        },
        _create: function() {
            var self = this,
            o = self.options,
            el = self.element,
            vt = $(self.ContactManager = $('<div />',{ 'id': 'ContactManager' })).appendTo(el);
            o.ajaxWait.dialog({
                autoOpen : false,
                resizable: false,
                title: 'Searching for Matching Voters',
                height: 220,
                width: 350,
                modal: true,
                hide: 'fade',
                overlay: {
                    backgroundColor: '#000',
                    opacity: 0.5
                }
            });
            $.ajaxSetup({
                dataType : "json",
                type: "POST",
                // url: 'index3.php',
                title: 'Please wait...',
                beforeSend: function(XMLHttpRequest, settings) {
                    o.ajaxWait.dialog("option", "title", this.title);
                    o.ajaxWait.dialog('open');                    
                },
                complete: function() {
                    o.ajaxWait.dialog('close');                    
                },
                async: true,
                error: function (jqXHR, textStatus, errorThrown) {
                    if(jqXHR.status === 0) {
                    // Session has probably expired and needs to reload and let CAS take care of the rest
                    // alert('Your session has expired, the page will need to reload and you may be asked to log back in');
                    // reload entire page - this leads to login page
                    // window.location.reload();
                    }
                } 
            });            
            self.buildMenu();                
        },
        buildMenu: function() {
            var self = this,
            o = self.options,
            el = self.element,
            vt = self.ContactManager,
            rt = $(self.rootTab = $('<ul />')).appendTo(vt);
//            o.ajaxImage.ajaxStart(function() {
//                $(this).fadeIn();
//            }).ajaxStop(function() {
//                    $(this).fadeOut();
//            });
            $.each(o.tabs,function(key,obj) {
                $.extend(o.tabs[key],{
                    item: $('<li />',{
                            "id": "#"+key
                        })
                        .append(
                            $('<a />',{
                                'href': "#"+key
                            })
                            .append(obj.label)
                        ),
                    content: $('<div />',{
                            "id": key
                        })
                });
                rt.append(o.tabs[key].item);
                vt.append(o.tabs[key].content);
                switch(key) {
                    case "search":
                        self.searchForm(o.tabs[key].content);
                        
                        break;
                    case "contact":
                        self.contactForm(o.tabs[key].content);
                        
                        break;
                }
                
            });
            vt.tabs();
        },
        getSearchOptions: function(callback) {
            $.ajax({
                title: "Please wait...",
                data: {
                    method: "getSearchOptions"
                },
                success: callback
            });            
        },
        getContactTypes: function(callback) {
            $.ajax({
                title: "Please wait...",
                data: {
                    method: "getContactTypes"
                },
                success: callback
            });            
        },
        getContacts: function(contactType,callback) {
            $.ajax({
                title: "Please wait...",
                data: {
                    method: "getContacts",
                    params: JSON.stringify({
                        contactType: contactType
                    })
                },
                success: callback
            });            
        },
        getSearchRows: function(conditions,callback) {
            if($.isEmptyObject(conditions)) {
                alert("ERROR! You must specify a minimum of one criteria!");
            } else {
                $.ajax({
                    title: "Searching for matching voters",
                    data: {
                        method: "getSearchRows",
                        params: JSON.stringify(conditions)
                    },
                    success: callback
                });            
            }
        },
        buildSearchRegistrationTable: function() {
            var self = this,
            el = self.element,
            o = self.options,
            sf = o.searchFields;
            sf.searchRegistrationTable
            .append(
                $('<tr />')
                .append(
                    $('<th />',{
                        "colspan": "2"
                    })
                    .html("Registration Parameters")
                    .addClass('ui-state-default ui-widget-header ui-corner-all')
                )
            );
            $.each(sf.registration,function(key,value) {
                sf.searchRegistrationTable.append(
                    $('<tr />')
                    .append(
                        $('<td />')
                        .append(
                            $('<label />',{
                                "for": key
                            })
                            .html(value.label)
                        )
                    )
                    .append(
                        $('<td />')
                        .append(
                            value.input
                            .prop({
                                "id": key
                            })
                            .each(function(index,input) {
                                var select;
                                switch(key) {
                                    case "party":
                                        select = $(input).append($('<option />').val("").html("--Select Party Registration--"));
                                        $.each(self.searchOptions.parties,function(index,party) {
                                            select.append(
                                                $('<option />').html(party["Party Description"]).val(party["Party Code"])
                                            );
                                        });
                                        break;
                                    case "status":
                                        select = $(input).append($('<option />').val("").html("--Select Registration Status--"));
                                        $.each(self.searchOptions.statuses,function(index,status) {
                                            select.append(
                                                $('<option />').html(status["Status Description"]).val(status["Status Code"])
                                            );
                                        });
                                        break;
                                }
                            })
                        )
                    )
                )
            });
            return sf.searchRegistrationTable;            
        },
        buildSearchLocationTable: function() {
            var self = this,
            el = self.element,
            o = self.options,
            sf = o.searchFields;
            sf.searchLocationTable
            .append(
                $('<tr />')
                .append(
                    $('<th />',{
                        "colspan": "2"
                    })
                    .html("Location Parameters")
                    .addClass('ui-state-default ui-widget-header ui-corner-all')
                )
            );
            $.each(sf.location,function(key,value) {
                sf.searchLocationTable.append(
                    $('<tr />')
                    .append(
                        $('<td />')
                        .append(
                            $('<label />',{
                                "for": key
                            })
                            .html(value.label)
                        )
                    )
                    .append(
                        $('<td />')
                        .append(
                            value.input
                            .prop({
                                "id": key
                            })
                            .each(function(index,input) {
                                switch(key) {
                                    case "county":
                                        var select = $(input).append($('<option />').val("").html("--Select County--"));
                                        $.each(self.searchOptions.counties,function(index,county) {
                                            select.append(
                                                $('<option />').html(county["County Description"]).val(county["County Code"])
                                            );
                                        });
                                        break;
                                }
                            })
                        )
                    )
                )
            });
            return sf.searchLocationTable;            
        },
        buildSearchNameTable: function() {
            var self = this,
            el = self.element,
            o = self.options,
            sf = o.searchFields;
            sf.searchNameTable
            .append(
                $('<tr />')
                .append(
                    $('<th />',{
                        "colspan": "2"
                    })
                    .html("Name Parameters")
                    .addClass('ui-state-default ui-widget-header ui-corner-all')
                )
            );
            $.each(sf.name,function(key,value) {
                sf.searchNameTable.append(
                    $('<tr />')
                    .append(
                        $('<td />')
                        .append(
                            $('<label />',{
                                "for": key
                            })
                            .html(value.label)
                        )
                    )
                    .append(
                        $('<td />')
                        .append(
                            value.input
                            .prop({
                                "id": key
                            })
                            .each(function(index,input) {
                                var select;
                                switch(key) {
                                    case "gender":
                                        select = $(input).append($('<option />').val("").html("--Specify Gender--"));
                                        $.each(self.searchOptions.genders,function(index,gender) {
                                            select.append(
                                                $('<option />').html(gender["Gender Description"]).val(gender["Gender Code"])
                                            );
                                        });
                                        break;
                                    case "race":
                                        select = $(input).append($('<option />').val("").html("--Specify Race--"));
                                        $.each(self.searchOptions.races,function(index,race) {
                                            select.append(
                                                $('<option />').html(race["Race Description"]).val(race["Race Code"])
                                            );
                                        });
                                        break;
                                }
                            })
                        )
                    )
                )
            });
            return sf.searchNameTable;
        },
        buildContactVoterRegistrationTable: function() {
            var self = this,
            el = self.element,
            o = self.options,
            sf = o.searchFields,
            sr = o.searchResults,
            info = o.contactVoterInfo.info;
            // registration
            return $('<table />')
            .append(
                $('<tr />')
                .append(
                    $('<th />',{
                        "colspan": "2"
                    })
                    .html("Voter Registration")
                    .addClass('ui-state-default ui-widget-header ui-corner-all')
                )
            ).each(function(index,contactVoterRegistrationTable) {
                $.each(info.registration,function(key,value) {
                    $(contactVoterRegistrationTable).append(
                        $('<tr />')
                        .append(
                            $('<td />')
                            .append(
                                $('<label />',{
                                    "for": key
                                })
                                .html(value.label)
                            )
                        )
                        .append(
                            $('<td />')
                            .append(
                                value.input
                                .prop({
                                    "id": key
                                })
                            )
                        )
                    )
                });                    
            });
        },
        buildContactVoterDemographicTable: function() {
            var self = this,
            el = self.element,
            o = self.options,
            sf = o.searchFields,
            sr = o.searchResults,
            info = o.contactVoterInfo.info;
            // demographic
            return $('<table />')
            .append(
                $('<tr />')
                .append(
                    $('<th />',{
                        "colspan": "2"
                    })
                    .html("Voter Demographic")
                    .addClass('ui-state-default ui-widget-header ui-corner-all')
                )
            ).each(function(index,contactVoterDemographicTable) {
                $.each(info.demographic,function(key,value) {
                    $(contactVoterDemographicTable).append(
                        $('<tr />')
                        .append(
                            $('<td />')
                            .append(
                                $('<label />',{
                                    "for": key
                                })
                                .html(value.label)
                            )
                        )
                        .append(
                            $('<td />')
                            .append(
                                value.input
                                .prop({
                                    "id": key
                                })
                            )
                        )
                    )
                });                    
            });
        },
        buildContactVoterBioTable: function() {
            var self = this,
            el = self.element,
            o = self.options,
            sf = o.searchFields,
            sr = o.searchResults,
            info = o.contactVoterInfo.info;
            // contactVoterInfo.info.bio
            return $('<table />')
            .append(
                $('<tr />')
                .append(
                    $('<th />',{
                        "colspan": "2"
                    })
                    .html("Voter Bio")
                    .addClass('ui-state-default ui-widget-header ui-corner-all')
                )
            ).each(function(index,contactVoterBioTable) {
                $.each(info.bio,function(key,value) {
                    $(contactVoterBioTable).append(
                        $('<tr />')
                        .append(
                            $('<td />')
                            .append(
                                $('<label />',{
                                    "for": key
                                })
                                .html(value.label)
                            )
                        )
                        .append(
                            $('<td />')
                            .append(
                                value.input
                                .prop({
                                    "id": key
                                })
                            )
                        )
                    )
                });                    
            });
        },
        buildContactFunctionsTable: function() {
            var self = this,
            el = self.element,
            o = self.options,
            sf = o.searchFields,
            sr = o.searchResults,
            fields = o.contactVoterInfo.fields;
            // contactVoterInfo.info.bio
            return $('<table />')
            .append(
                $('<tr />')
                .append(
                    $('<th />',{
                        "colspan": "2"
                    })
                    .html("Contact Administration Functions")
                    .addClass('ui-state-default ui-widget-header ui-corner-all')
                )
            ).each(function(index,contactFunctionsTable) {
                $.each(fields.fnx,function(key,value) {
                    $(contactFunctionsTable).append(
                        $('<tr />')
                        .append(
                            $('<td />')
                            .append(
                                $('<label />',{
                                    "for": key
                                })
                                .html(value.label)
                            )
                        )
                        .append(
                            $('<td />')
                            .append(
                                value.input
                                .prop({
                                    "id": key
                                })
                                .each(function(index,input) {
                                    switch(key) {
                                        case "contactType":
                                            self.getContactTypes(function(getContactTypesResponse) {
                                                $.each(getContactTypesResponse.types,function(index,type) {
                                                    $(input)
                                                    .append(
                                                        $('<option />').val(type["Contact Type"]).html(type["Contact Description"])
                                                    );
                                                });
                                                $(input).change(function() {
                                                    self.getContacts($(this).val(),function(getContactsResponse) {
                                                        fields.fnx.currentContact.input.empty();
                                                        $.each(getContactsResponse.contacts,function(index,contact) {
                                                            fields.fnx.currentContact.input.append(
                                                                $('<option />').val(contact["Contact ID"]).html("Nothing Yet")
                                                            );
                                                        });
                                                    });
                                                }).change();
                                            });
                                            break;
                                        case "contactButton":
                                            fields.fnx.contactButton.input.click(function() {
                                                var hash = $(this).data();
                                                hash.dialog = $('<div />')
                                                .addClass('ui-state-default ui-widget-content')
                                                .append(
                                                    $('<p />')
                                                    .css({
                                                        "text-align": "center",
                                                        "margin-top": "0px",
                                                        "margin-bottom": "0px",
                                                        "padding": "0px"
                                                    })
                                                )                                                
                                                .dialog({
                                                    autoOpen: true,
                                                    bgiframe: true,
                                                    resizable: false,
                                                    title: 'Add New Contact',
                                                    height:620,
                                                    width:760,
                                                    modal: true,
                                                    zIndex: 3999,
                                                    overlay: {
                                                        backgroundColor: '#000',
                                                        opacity: 0.5
                                                    },
                                                    open: function() {
                                                        $(hash.first = $('<input />'))
                                                        .appendTo($(this));
//                                                        $.cimsPR.schedule.services.ajaxRetrieveChainRules({
//                                                            recursionIndex: 3
//                                                        });
                                                    },
                                                    buttons: {
                                                        "Create New Contact": function() {
                                                            
                                                        },
                                                        "Cancel": function() {
                                                            $(this).dialog('close');
                                                            $(this).dialog('destroy');
                                                            $(this).remove();
                                                        }
                                                    }
                                                });
                                            });
                                            break;
                                    }
                                    // contactType
                                })
                            )
                        )
                    )
                });                    
            });            
        },
        contactForm: function(tabDiv) {
            var self = this,
            el = self.element,
            o = self.options,
            sf = o.searchFields,
            sr = o.searchResults;
            
            $(self.voterInfoDiv = $('<div />'))
            .appendTo(tabDiv)
            .addClass('ui-widget-content')
            .width('100%')
            .append(
                $('<fieldset />')
                .addClass('ui-widget-content')
                .append(
                    $('<legend />')
                    .html("Voter Information")
                    .addClass('ui-state-default ui-widget-header ui-corner-all')
                )
                .append(
                    $('<table />')
                    .append(
                        $('<tbody />')
                        .append(
                            $('<tr />')
                            .append(
                                $('<td />')
                                .css({
                                    "vertical-align": "top"
                                })
                                .append(self.buildContactVoterBioTable())
                            )
                            .append(
                                $('<td />')
                                .css({
                                    "vertical-align": "top"
                                })
                                .append(self.buildContactVoterRegistrationTable())
                            )
                            .append(
                                $('<td />')
                                .css({
                                    "vertical-align": "top"
                                })
                                .append(self.buildContactVoterDemographicTable())
                            )
                        )
                    )
                )
            );
            $(self.contactInfoDiv = $('<div />'))
            .appendTo(tabDiv)
            .addClass('ui-widget-content')
            .width('100%')
            .append(
                $('<fieldset />')
                .addClass('ui-widget-content')
                .append(
                    $('<legend />')
                    .html("Contact Information")
                    .addClass('ui-state-default ui-widget-header ui-corner-all')
                )
                .append(
                    $('<table />')
                    .append(
                        $('<tbody />')
                        .append(
                            $('<tr />')
                            .append(
                                $('<td />')
                                .css({
                                    "vertical-align": "top"
                                })
                                .append(self.buildContactFunctionsTable())
                            )
                        )
                    )
                )
            );    
        },
        searchForm: function(tabDiv) {
            var self = this,
            el = self.element,
            o = self.options,
            sf = o.searchFields,
            sr = o.searchResults,
            se = self.searchElements = {};
            self.getSearchOptions(function(searchOptionsResponse) {
                self.searchOptions = searchOptionsResponse;
                sf.searchFieldset.appendTo(tabDiv)
                .append(
                    $('<table />')
                    .append(
                        $('<tfoot />')
                        .append(
                            $('<tr />')
                            .append(
                                $('<td />',{
                                    "colspan": "3"
                                })
                                .css({
                                    "vertical-align": "top"
                                })
                                .append(sf.searchButton)
                            )
                        )
                    )
                    .append(
                        $('<tbody />')
                        .append(
                            $('<tr />')
                            .append(
                                $('<td />')
                                .css({
                                    "vertical-align": "top"
                                })
                                .append(self.buildSearchNameTable())
                            )
                            .append(
                                $('<td />')
                                .css({
                                    "vertical-align": "top"
                                })
                                .append(self.buildSearchLocationTable())
                            )
                            .append(
                                $('<td />')
                                .css({
                                    "vertical-align": "top"
                                })
                                .append(self.buildSearchRegistrationTable())
                            )
                        )                        
                    )
                );

                tabDiv
                .append(sr.searchResultTable);
                $.extend(sr,{
                    searchResultDataTable: sr.searchResultTable
                        .width("99%")
                        .dataTable({
                            "aoColumns": $.merge([
                                { "sTitle": "Reserved for Later&nbsp;","sClass": "NestedRuleChainJobColumn","bVisible": true,"mDataProp": null,"sDefaultContent":"" }                                
                            ],$.map(self.searchOptions.voterColumns,function(column,index) {
                                return {
                                    "sTitle": column.Field,
                                    "sClass": "NestRuleChainJobColumn",
                                    "bVisible": true,
                                    "mDataProp": column.Field,
                                    "sDefaultContent": ""
                                }
                            })),
                            "sScrollX": "100%",
                            "bStateSave": true,
                            "bProcessing": true,
                            "bJQueryUI": true,
                            "bSort": false,
                            "bAutoWidth": false,
                            "sPaginationType": "full_numbers",
                            "aaData": []                
                        })
                });
                sf.searchButton.click(function() {
                    var searchCriteria = $.extend({},
                        ($.trim(sf.name.firstName.input.val()) == "")?{}:{ first: $.trim(sf.name.firstName.input.val()) },
                        ($.trim(sf.name.middleName.input.val()) == "")?{}:{ middle: $.trim(sf.name.middleName.input.val()) },
                        ($.trim(sf.name.lastName.input.val()) == "")?{}:{ last: $.trim(sf.name.lastName.input.val()) },
                        ($.trim(sf.name.gender.input.val()) == "")?{}:{ gender: $.trim(sf.name.gender.input.val()) },
                        ($.trim(sf.name.race.input.val()) == "")?{}:{ race: $.trim(sf.name.race.input.val()) },
                        ($.trim(sf.location.county.input.val()) == "")?{}:{ county: $.trim(sf.location.county.input.val()) },
                        ($.trim(sf.location.address.input.val()) == "")?{}:{ address: $.trim(sf.location.address.input.val()) },
                        ($.trim(sf.location.city.input.val()) == "")?{}:{ city: $.trim(sf.location.city.input.val()) },
                        ($.trim(sf.location.zip.input.val()) == "")?{}:{ zip: $.trim(sf.location.zip.input.val()) },
                        ($.trim(sf.registration.party.input.val()) == "")?{}:{ party: $.trim(sf.registration.party.input.val()) },
                        ($.trim(sf.registration.status.input.val()) == "")?{}:{ status: $.trim(sf.registration.status.input.val()) },
                        ($.trim(sf.registration.congressionalDistrict.input.val()) == "")?{}:{ congressionalDistrict: $.trim(sf.registration.congressionalDistrict.input.val()) },
                        ($.trim(sf.registration.houseDistrict.input.val()) == "")?{}:{ houseDistrict: $.trim(sf.registration.houseDistrict.input.val()) },
                        ($.trim(sf.registration.senateDistrict.input.val()) == "")?{}:{ senateDistrict: $.trim(sf.registration.senateDistrict.input.val()) },
                        ($.trim(sf.registration.countyCommissionDistrict.input.val()) == "")?{}:{ countyCommissionDistrict: $.trim(sf.registration.countyCommissionDistrict.input.val()) },
                        ($.trim(sf.registration.schoolBoardDistrict.input.val()) == "")?{}:{ schoolBoardDistrict: $.trim(sf.registration.schoolBoardDistrict.input.val()) },
                        ($.trim(sf.registration.precinct.input.val()) == "")?{}:{ precinct: $.trim(sf.registration.precinct.input.val()) },
                        ($.trim(sf.registration.precinctGroup.input.val()) == "")?{}:{ precinctGroup: $.trim(sf.registration.precinctGroup.input.val()) },
                        ($.trim(sf.registration.precinctSplit.input.val()) == "")?{}:{ precinctSplit: $.trim(sf.registration.precinctSplit.input.val()) },
                        ($.trim(sf.registration.precinctSuffix.input.val()) == "")?{}:{ precinctSuffix: $.trim(sf.registration.precinctSuffix.input.val()) }
                    );
                    // conditions
                    self.getSearchRows(searchCriteria,function(getSearchRowsResult) {
                        sr.searchResultDataTable.fnClearTable();
                        sr.searchResultDataTable.fnAddData(getSearchRowsResult.rows);
                    });
                });


            });
            
        },
        _setOption: function(option, value) {
            $.Widget.prototype._setOption.apply( this, arguments );
            var self = this,
            el = self.element,
            o = self.options;
        }
    });
})(jQuery);
