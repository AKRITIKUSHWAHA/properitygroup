/**
 * UK Postcode & Address Lookup Service
 * Supports Ideal Postcodes (Full Royal Mail PAF addresses) with
 * automatic fallback to free UK postcodes.io for postal sector validation
 */

export const lookupPostcode = async (rawPostcode) => {
  if (!rawPostcode || typeof rawPostcode !== 'string') {
    throw new Error('Valid UK Postcode is required');
  }

  const cleaned = rawPostcode.trim().toUpperCase();
  const idealApiKey = process.env.IDEAL_POSTCODES_API_KEY;
  const isIdealConfigured = Boolean(idealApiKey && idealApiKey.length > 5);

  // 1. If Ideal Postcodes API key is configured by client
  if (isIdealConfigured) {
    try {
      const url = `https://api.ideal-postcodes.co.uk/v1/postcodes/${encodeURIComponent(cleaned)}?api_key=${idealApiKey}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data?.result && Array.isArray(data.result)) {
        return {
          success: true,
          provider: 'ideal_postcodes_live',
          postcode: cleaned,
          total: data.result.length,
          addresses: data.result.map((item) => ({
            line_1: item.line_1,
            line_2: item.line_2 || '',
            line_3: item.line_3 || '',
            post_town: item.post_town,
            postcode: item.postcode,
            fullAddress: [item.line_1, item.line_2, item.post_town, item.postcode].filter(Boolean).join(', '),
            premise: item.building_number || item.building_name || '',
            thoroughfare: item.thoroughfare || '',
          })),
        };
      }
    } catch (err) {
      console.warn('Ideal Postcodes request failed, falling back to free postcodes.io:', err.message);
    }
  }

  // 2. Fallback to free official UK Royal Mail / Ordnance Survey Postcode API (postcodes.io)
  // No API key required, 100% free
  try {
    const url = `https://api.postcodes.io/postcodes/${encodeURIComponent(cleaned)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data?.status === 200 && data.result) {
      const r = data.result;
      return {
        success: true,
        provider: 'postcodes_io_free',
        postcode: r.postcode,
        region: r.region || 'London & South East',
        district: r.admin_district,
        ward: r.admin_ward,
        parliamentary_constituency: r.parliamentary_constituency,
        latitude: r.latitude,
        longitude: r.longitude,
        outwardCode: r.outcode,
        message: isIdealConfigured
          ? 'Looked up via postcodes.io fallback'
          : 'Free postcodes.io active. Add IDEAL_POSTCODES_API_KEY for individual street address dropdowns.',
      };
    }
  } catch (err) {
    console.warn('Free postcodes.io lookup failed:', err.message);
  }

  // Basic regex validation if network fails
  const ukPostcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
  const isValidFormat = ukPostcodeRegex.test(cleaned);

  return {
    success: isValidFormat,
    provider: 'regex_offline',
    postcode: cleaned,
    isValid: isValidFormat,
    message: isValidFormat ? 'Valid UK Postcode format' : 'Invalid UK Postcode format',
  };
};

export const validateUKPostcode = async (postcode) => {
  const result = await lookupPostcode(postcode);
  return result.success;
};
