/*global define*/
(function (window) {
    define([
        'Internationalization',
        'Configuration',
        'Environment'
    ], function (
        i18n,
        CONFIG,
        Environment
    ) {
        console.log('EditorConfig - File loaded. ');

        var EditorConfig = {
            CONTACT_DATA_TEMPLATE : {
                id : '',
                name : {
                    id : '',
                    display_name : ''
                },
                photo : [{
                    id : '',
                    data : ''
                }],
                account_name : '',
                account_type : '',
                nickname : [{
                    id : '',
                    name : ''
                }],
                group : [],
                starred : 0,
                phone : [{
                    id : '',
                    type : 2,
                    number : ''
                }],
                email : [{
                    id : '',
                    type : 2,
                    address : ''
                }],
                IM : [{
                    id : '',
                    protocol : 4,
                    data : ''
                }],
                address : [{
                    id : '',
                    type : 1,
                    formatted_address : ''
                }],
                organization : [{
                    id : '',
                    type : 1,
                    company : ''
                }],
                note : [{
                    id : '',
                    note : ''
                }]
            },
            CATEGORY_LIST : ['phone', 'email', 'IM', 'address', 'organization', 'note'],
            PHONE_OPTION : [{
                name : i18n.contact.HOME_NUMBER,
                value : 1
            }, {
                name : i18n.contact.CELL_PHONE,
                value : 2
            }, {
                name : i18n.contact.WORK_NUMBER,
                value : 3
            }, {
                name : i18n.contact.WORK_FAX,
                value : 4
            }, {
                name : i18n.contact.HOME_FAX,
                value : 5
            }, {
                name : i18n.contact.BP_CALL,
                value : 6
            }, {
                name : i18n.contact.OTHER_NUMBER,
                value : 7
            }, {
                name : i18n.contact.CALLBACK,
                value : 8
            }, {
                name : i18n.contact.CAR,
                value : 9
            }, {
                name : i18n.contact.COMPANY_MAIN,
                value : 10
            }, {
                name : i18n.contact.ISDN,
                value : 11
            }, {
                name : i18n.contact.MAIN,
                value : 12
            }, {
                name : i18n.contact.OTHER_FAX,
                value : 13
            }, {
                name : i18n.contact.RADIO,
                value : 14
            }, {
                name : i18n.contact.TELEX,
                value : 15
            }, {
                name : i18n.contact.TTY_TDD,
                value : 16
            }, {
                name : i18n.contact.WORK_MOBILE,
                value : 17
            }, {
                name : i18n.contact.WORK_PAGER,
                value : 18
            }, {
                name : i18n.contact.ASSISTANT,
                value : 19
            }, {
                name : i18n.misc.MMS,
                value : 20
            }, {
                name : i18n.contact.CUSTOME,
                value : 0
            }],
            EMAIL_OPTION : [{
                name : i18n.contact.HOME_MAIL,
                value : 1
            }, {
                name : i18n.contact.WORK_MAIL,
                value : 2
            }, {
                name : i18n.contact.OTHER_MAIL,
                value : 3
            }, {
                name : i18n.contact.CUSTOME,
                value : 0
            }],
            IM_OPTION : Environment.get('locale') === CONFIG.enums.LOCALE_EN_US ? [{
                name : 'AIM',
                value : 0
            }, {
                name : 'Gtalk',
                value : 5
            }, {
                name : 'ICQ',
                value : 6
            }, {
                name : 'MSN',
                value : 1
            }, {
                name : 'Skype',
                value : 3
            }, {
                name : 'Yahoo',
                value : 2
            }, {
                name : 'Custom...',
                value : -1
            }] : [{
                name : 'AIM',
                value : 0
            }, {
                name : 'MSN',
                value : 1
            }, {
                name : 'Yahoo',
                value : 2
            }, {
                name : 'Skype',
                value : 3
            }, {
                name : 'QQ',
                value : 4
            }, {
                name : 'Gtalk',
                value : 5
            }, {
                name : 'ICQ',
                value : 6
            }, {
                name : 'Jabber',
                value : 7
            }, {
                name : i18n.contact.CUSTOM,
                value : -1
            }],
            ADDRESS_OPTION : [{
                name : i18n.contact.HOME_ADDRESS,
                value : 1
            }, {
                name : i18n.contact.WORK_ADDRESS,
                value : 2
            }, {
                name : i18n.contact.OTHER_ADDRESS,
                value : 3
            }, {
                name : i18n.contact.CUSTOME,
                value : 0
            }],
            ORGANIZATION_OPTION : [{
                name : i18n.contact.WORK,
                value : 1
            }, {
                name : i18n.contact.OTHER,
                value : 2
            }, {
                name : i18n.contact.CUSTOME,
                value : 0
            }],
            CATEGORY_MENU : [{
                name : i18n.contact.PHONE,
                value : 'phone'
            }, {
                name : i18n.contact.EMAIL,
                value : 'email'
            }, {
                name : i18n.contact.IM,
                value : 'IM'
            }, {
                name : i18n.contact.ADDRESS,
                value : 'address'
            }, {
                name : i18n.contact.ORG,
                value : 'organization'
            }]
        };

        return EditorConfig;
    });
}(this));
