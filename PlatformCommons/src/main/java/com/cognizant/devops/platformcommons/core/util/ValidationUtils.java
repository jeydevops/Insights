/*******************************************************************************
 * Copyright 2017 Cognizant Technology Solutions
 *   
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License.  You may obtain a copy
 * 	of the License at
 *   
 * 	http://www.apache.org/licenses/LICENSE-2.0
 *   
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the
 * License for the specific language governing permissions and limitations under
 * the License.
 ******************************************************************************/
package com.cognizant.devops.platformcommons.core.util;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import com.cognizant.devops.platformcommons.constants.PlatformServiceConstants;
import com.cognizant.devops.platformcommons.exception.InsightsCustomException;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

public class ValidationUtils {
	private static final Logger log = LogManager.getLogger(ComponentHealthLogger.class);
	private static Pattern agentNamePattern = Pattern.compile("[^A-Za-z]", Pattern.CASE_INSENSITIVE);
	private static Pattern CRLF = Pattern.compile("(\r\n|\r|\n|\n\r)");
	private static Pattern agentIdPattern = Pattern.compile("[^A-Za-z0-9\\_]", Pattern.CASE_INSENSITIVE);

	public static String checkHTTPResponseSplitting(String value, boolean isReplace) {
		Pattern CRLF = Pattern.compile("(\r\n|\r|\n|\n\r)");
		Matcher valueMatcher = CRLF.matcher(value);
		if (valueMatcher.find()) {
			if (isReplace) {
				value = value.replace("\\n", "").replace("\\r", "");
			} else {
				value = "";
			}
		}
		return value;
	}

	public static boolean checkString(String toolName) {
		boolean returnBoolean = false;

		Matcher m = agentNamePattern.matcher(toolName);
		if (m.find()) {
			returnBoolean = true;
		}
		return returnBoolean;
	}

	public static boolean checkNewLineCarriage(String value) {
		boolean returnBoolean = false;
		Matcher m = CRLF.matcher(value);
		if (m.find()) {
			returnBoolean = true;
		}
		return returnBoolean;
	}

	public static boolean checkAgentIdString(String agentId) {
		boolean returnBoolean = false;

		Matcher m = agentIdPattern.matcher(agentId);
		if (m.find()) {
			returnBoolean = true;
		}
		return returnBoolean;
	}

	/**
	 * Validate response data which doesnot contain any HTML String
	 * 
	 * @param JsonObject
	 *            data
	 * @return JsonObject
	 */
	public static JsonObject validateStringForHTMLContent(JsonObject data) {
		String strRegEx = "<[^>]*>";
		String jsonString = "";
		JsonObject json = null;

		// log.debug(" validateStringForHTMLContent string before " + data);

		if (data instanceof JsonObject) {
			jsonString = data.toString();
			// log.debug(" validateStringForHTMLContent after assigment " + jsonString);
			if (jsonString != null) {
				jsonString = jsonString.replaceAll(strRegEx, "");
				// replace &nbsp; with space
				jsonString = jsonString.replace("&nbsp;", " ");
				// replace &amp; with &
				jsonString = jsonString.replace("&amp;", "&");
			}
			if (!jsonString.equalsIgnoreCase(data.toString())) {
				log.debug(" Invilid response data ");
				json = null;
			}else {
				json = new Gson().fromJson(jsonString, JsonObject.class);
			}
			// log.debug(" validateStringForHTMLContent after " + jsonString);
		}
		return json;
	}

	/**
	 * Pattern Array defination for XSS
	 */
	private static Pattern[] patterns = new Pattern[] {
			// Script fragments
			Pattern.compile("<script>(.*?)</script>", Pattern.CASE_INSENSITIVE),
			Pattern.compile("src[\r\n]*=[\r\n]*\\\'(.*?)\\\'",
					Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL),
			Pattern.compile("src[\r\n]*=[\r\n]*\\\"(.*?)\\\"",
					Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL),
			Pattern.compile("</script>", Pattern.CASE_INSENSITIVE),
			Pattern.compile("<script(.*?)>", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL),
			Pattern.compile("eval\\((.*?)\\)", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL),
			Pattern.compile("expression\\((.*?)\\)", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL),
			Pattern.compile("javascript:", Pattern.CASE_INSENSITIVE),
			Pattern.compile("vbscript:", Pattern.CASE_INSENSITIVE),
			Pattern.compile("onload(.*?)=", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL),
			Pattern.compile("(\r\n|\r|\n|\n\r)") };

	/**
	 * Strips any potential XSS threats out of the value
	 * 
	 * @param value
	 * @return
	 * @throws InsightsCustomException
	 */
	public static String cleanXSS(String value) {
		Boolean isXSSPattern = Boolean.FALSE;
		// log.debug("In cleanXSS RequestWrapper ..............." + value);
		if (value != null || !("").equals(value)) {
			try {
				// match sections that match a pattern
				for (Pattern scriptPattern : patterns) {
					Matcher m = scriptPattern.matcher(value);
					if (m.find()) {
						isXSSPattern = true;
						break;
					}
				}
				if (isXSSPattern) {
					throw new RuntimeException(PlatformServiceConstants.INVALID_REQUEST);
				}
			} catch (RuntimeException e) {
				log.error("Invalid pattern found in data value ==== " + value);
				throw new RuntimeException(PlatformServiceConstants.INVALID_REQUEST);
			}
		}
		return value;
	}

	public static String extactAutharizationToken(String authHeaderToken)   {
		String authTokenDecrypt = "";
		try {
			log.debug(" authHeaderToken String " + authHeaderToken);
			if (!authHeaderToken.startsWith("Basic ")) {

				String auth = authHeaderToken.substring(0, authHeaderToken.length() - 15);
				String passkey = authHeaderToken.substring(authHeaderToken.length() - 15, authHeaderToken.length());

				//log.debug(" authHeader ==========  " + authHeaderToken);
				//log.debug(" auth " + auth + "  key   " + passkey);

				authTokenDecrypt = AES256Cryptor.decrypt(auth, passkey);
			} else {
				authTokenDecrypt = authHeaderToken;
			}
			//log.debug(" authTokenDecrypt  ========= " + authTokenDecrypt);
		} catch (Exception e) {
			log.error(" InsightsCustomException Invalid Autharization Token " + e.getMessage());
			throw new RuntimeException(PlatformServiceConstants.INVALID_TOKEN);
		}
		return authTokenDecrypt;
	}

}
