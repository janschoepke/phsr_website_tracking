# phsr website tracking

This script is used for tracking web statistics and conversions in phsr. There are no dependencies to other scripts or libs like jQuery, so this is really lightweight. To enable website tracking, just embed the following code before the closing body tag on website:

```
<script>
        var settings = {
            phsrid: <replace with phsrid set in pshr backend>,
            mailingid: <replace with the mailings id>,
            anonymizeip: false,
            phsrserver: "<replace with URL to phsr backend>"
        };

        (function(p, h, s, r) {
            r=p.createElement(s);r.src=h;p.body.appendChild(r);
        })(document, '<replace with absolute path to tracking.js-file>', 'script');
</script>

```
As it can be seen in the aboves example, you can specify some settings. This is a list of all currently supported settings: 


| **option**      | **default** | **type**    | **required?** | **explaination**                                                                                  |
|-------------|---------|---------|-----------|-----------------------------------------------------------------------------------------------|
| phsrid      | 0       | number  | **required**  | ID of the phsr-instance set in phsr backend.                                                  |
| mailingid   | 0       | number  | **required**  | ID of the mailing, where the current website is linked in.                                    |
| phsrserver  | ""      | string  | **required**  | URL to the phsr backend server.                                                               |
| anonymizeip | false   | boolean | optional  | Specifies, if the victims ip should be tracked or not.                                        |
| debug       | false   | boolean | optional  | Specifies, if the application runs in debug mode or not. Enables some log outputs to console. |

Enabling conversion tracking is simple: 

```
<form method="post" action="" data-conversion="Loginfield"  data-fields="{'user': 'username', 'pass': 'password'}">
    <input type="text" name="username" id="username" placeholder="Username" />
    <input type="password" name="password" id="password" placeholder="Password" />
    <input type="submit" value="submit" />
</form>
```

Every form can be tracked as conversion, all you have to do is adding a "data-conversion"-Attribute to the form-Tag. It is also possible to track the user's submitted form data by adding the "data-fields"-Attribute, which should contain a JSON-Object, where the key should be the naming of the field, and the value is the ID of the field to be tracked in the current form. 