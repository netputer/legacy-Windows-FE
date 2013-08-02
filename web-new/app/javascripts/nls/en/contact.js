/*global define*/
define({
    ACCOUNT_TYPE_GOOGLE : 'Google ',
    ACCOUNT_TYPE_PHONE : 'Phone ',
    ACCOUNT_TYPE_SIM : 'SIM card ',
    ACCOUNT_TYPE_OTHER : 'Other ',

    ACCOUNT_LOADING : 'Loading...',
    ACCOUNT_ALL : 'All accounts ',
    UNNAMED_CONTACT : 'Unknown contacts',

    GROUP_ALL : 'All groups',
    GROUP_LOADING : 'Loading group info...',

    ALERT_TIP_EXOPRT_OUTLOOK : '<p>Export completed! </p><p>Outlook CSV format only supports 3 phone numbers or email addresses. It doesn\'t accept chat or profile pictures.</p>',
    ALERT_TIP_EXOPRT_WINDOWS_MAIL : '<p>Export completed! </p><p>Windows Mail CSV supports only 2 phone numbers, one fax, and  one e-mail address. It doesn\'t accept groups, chat, or profile pictures.</p>',
    ALERT_TIP_EXOPRT_NOKIA : '<p>Export completed!</p><p>Nokia CSV supports only 3 phone numbers, 2 fax numbers, and email addresses. It doesn\'t accept groups, chat, or profile pictures.</p>',
    ALERT_TIP_EXOPRT_VCARD : 'Because the CSV format is prone to errors, SnapPea recommends you export contacts in the vCard format.',
    ALERT_TIP_MERGE_MANY_CONTACTS : 'Merging all your contacts can take a while. Continue?',
    ALERT_TIP_MERGE_CONTACTS : '<p> Merge {1} selected contacts? </p><p> {2} contacts will be deleted after merging</p>',
    ALERT_TIP_DEL_SINGLE_CONTACT : 'Delete selected contact?',

    GROUP_ALREADY_EXSIST : 'Duplicate name',
    PLEASE_INPUT_GROUP_NAME : 'Enter group name',
    QUICK_ADD_CONTACT : 'Add contact',
    NAME : 'Name',
    CELL_PHONE : 'Mobile',
    EMAIL : 'Email',
    SAVE_SUCCESS : 'Saved',
    SAVE_FAILED : 'Failed to save',

    CANNOT_EDIT_CONTACTS_UNDER_READONLY_ACCOUNT : 'Contact is read-only, cannot edit',
    EDIT : 'Edit',
    ADD_CONTACT_METHOD : 'Add entry',
    CONTACT_INFO : 'Contact info',
    CHANGE_AVATAR : 'Edit',
    SEND_MAIL : 'Send Email',
    REMARK : 'Notes',
    MERGE : 'Merge',
    DIAL : 'Call number',
    DIAL_SUCCESS : 'Number was sent to your phone, complete the call on your phone!',

    SELECT_CONATCTS_BAKCUP_FILE : 'Select .vcf or .csv file',
    INVALID_BAKCUP_FILE : 'Invalid .vcf or .csv file',
    SELECT_ACCOUNT_TO_IMPORT : 'Select account to import contacts to:',
    SELECT_EXPORT_FORMAT : 'Select file format:',
    V_CARD : 'vCard',
    OUTLOOK : 'Outlook 2003/2007/2010 CSV',
    NOKIA : 'Nokia CSV',
    WINDOW_MAIN : 'Windows Mail CSV',
    SELECT_COUNTACTS_TO_EXPORT : 'Select contacts to export',
    CURRENT_SELECT : 'Contacts currently selected ',
    CONTACT_HAS_NUMBER : 'Contacts with a phone number ',
    GROUP : 'Group ',

    MANAGE_GROUP : 'Manage group...',
    CONTACT_RECORD : 'Contact history',
    CUSTOME_CONTACT_INFO : 'Custom Entry',

    HOME_NUMBER : 'Home number',
    WORK_NUMBER : 'Work number',
    WORK_FAX : 'Work fax',
    HOME_FAX : 'Home fax',
    BP_CALL : 'Pager',
    OTHER_NUMBER : 'Other number',
    CALLBACK : 'Callback',
    CAR : 'Car phone',
    COMPANY_MAIN : 'Work number',
    ISDN : 'ISDN',
    MAIN : 'Main number',
    OTHER_FAX : 'Other fax',
    RADIO : 'Radio',
    TELEX : 'Telex',
    TTY_TDD : 'TTY TDD',
    WORK_MOBILE : 'Work mobile',
    WORK_PAGER : 'Work pager',
    ASSISTANT : 'Assistant',
    CUSTOME : 'Custom...',

    HOME_MAIL : 'Home email',
    WORK_MAIL : 'Work email',
    OTHER_MAIL : 'Other email',

    HOME_ADDRESS : 'Home address',
    WORK_ADDRESS : 'Work address',
    OTHER_ADDRESS : 'Other address',

    WORK : 'Company',
    OTHER : 'Other',

    PHONE : 'Phone',
    IM : 'IM',
    ADDRESS : 'Address',
    ORG : 'Organization',

    IMPORT_PARTIAL_FAILED : 'Failed to import some of your contacts',
    IMPORTING_CONTACT : 'Importing contacts, please wait...',
    IMPORT_CONTACT_FINISH : 'Importing contacts completed',
    EXPORT_CONTACT_FAILED : 'Failed to import contacts',
    ADD_GROUP : 'Add group...',

    /****************/

    BUTTON_ADD_CONTACT_LABEL : 'New contact',
    WINDOW_IMPORT_TITLE : 'Import Contacts',
    WINDOW_EXPORT_TITLE : 'Export Contacts',

    DELETE_TIP_TEXT : 'Delete {1} selected contact(s)?',

    NON_CONTACT_TEXT_PERMISSION : 'SnapPea is unable to display your contacts. A security app on your phone may be blocking SnapPea, please enable this permission on your phone.',
    NON_CONTACT_TEXT : 'You haven\'t added any contacts',
    NON_PHONE_CONTACT_TEXT : 'You don\'t have any contacts with a phone number',
    NON_STAR_CONTACT_TEXT : 'To add a favorite, click on the star next to a contact',

    SAVE_TIP_TEXT : 'Save changes made to contacts? ',


    NO_EMAIL_CLIENT_TIP : '<p>Sorry, couldn\'t open email. Set a default email client and try again! </p>',

    GROUP_MANAGER_TITLE : 'Edit Groups',
    CURRENT_ACCOUNT_LABEL : 'Current account: ',
    GROUP_NAME_LABEL : 'Group name',
    GROUP_CD_LABEL : 'Edit',
    GROUP_UPDATE_LABEL : 'Rename',
    GROUP_ADD_LABEL : 'Add group',
    UNEDITABLE_GROUP_TEXT : 'System group',
    GROUP_DELETED_TEXT : 'Deleted',
    UNGROUP_CONTACT_LABEL : 'No group',
    CONTACT_ALL_TEXT : '{1} total contacts',
    CONTACT_GROUP_TEXT : '{1} contacts in group',
    CONTACT_ACCOUNT_TEXT : '{1} contacts in account',
    CONTACT_DELETE_SUCCESS : 'Removed {1} contact(s)',
    CONTACT_DELETE_FAILED_TEXT : 'Failed to delete the following contacts',
    CONTACT_SIM_SELECT_TEXT_1 : 'Import SIM card contacts to your phone',
    CONTACT_SIM_SELECT_TEXT_2 : 'SnapPea can\'t edit contacts on your SIM card. Import the contacts to your internal storage as shown below and try again!',
    CONTACT_READ_ONLY_TIP : 'You\'ve selected contacts from a read-only account, so you can\'t edit them. <br/><br/>Ignore these contacts and continue? ',

    /* Import and export */
    DUPLICATE : '{1} duplicate contact(s) ignored',
    EXPORT_PROGRESS_DESC2 : 'Exporting contacts, please wait...',
    EXPORT_SUCCESS_DESC2 : 'Exporting contacts completed',


    EDIT_CONTACT_HEAD : 'Edit profile picture',
    EDIT_CONTACT_HEAD_SELECT_SOURCE : 'Select file: ',
    EDIT_CONTACT_HEAD_SOURCE_BY_PHONE : 'My Photos',
    EDIT_CONTACT_HEAD_SOURCE_BY_LIBRARY : 'Photo Library',
    EDIT_CONTACT_HEAD_PC_SOURCE : 'Select file',
    EDIT_CONTACT_HEAD_DEL_TEXT : 'Delete profile picture',
    ALERT_DEL_CONTACT_HEAD : 'Delete profile picture?',
    ALERT_PIC_FORMAT_TIP : 'Note: profile pictures must be in JPG or PNG format.',
    ALERT_BATCH_MOVE_GROUP : '<p>The contacts {1} to {2} aren\'t in the account {3}. </p><p>This will move these contacts from their original account to the new one. Continue?</p>',
    ALERT_BATCH_MOVE_GROUP_SINGLE : '<p>"{1}" isn\'t in the account {2}.</p><p>This will move these contacts from their original account to the new one. Continue?</p>',

    BATCH_CONTACT_TITLE : '{1} contact(s) selected',
    ALERT_SELECT_MORE_CSV_FILE : 'Sorry, SnapPea only supports one CSV file at a time. Please try again!',
    IMPORT_CONTACTS_FAIL : 'Failed to import contacts',
    CONTACT_BATCH_GROUP_PROGRESS : 'Adding to group, please wait...',
    CONTACT_BATCH_GROUP_SUCCESS : 'Added {1} contacts to group',
    GROUP_NAME : 'Group name: ',
    ADD_GROUP_FAIL : 'Failed to add to group',
    GROUP_TIP : ' (Only this format will retain group information)',

    SELECT_BACKUP_FILE : 'Select automatic backup file',
    BACKUP_MESSAGE_NUMBER : 'Contacts',
    IMPORT_FROM_BACKUP : 'Import from backup',

    EXPORT_USING_VCARD : 'Export in vCard format',

    CONTACT_TIP_PART : '{1} contacts related to「{2}」',

    EMPTY_PHONE_LIST : 'Import a picture here!',
    EMPTY_LIBRARY_LIST : 'Import a picture here!',

    NAV_CONTACT_ALL : 'All Contacts'
});
