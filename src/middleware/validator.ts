import { body } from "express-validator";

export const auctionValidator = [
	body("price").isInt({ min: 0 }).toInt().withMessage("Qiymət daxil edin."),
	body("description").isString().notEmpty().withMessage("Haqqında mətni daxil edin."),
	body("images").isArray().withMessage("Şəkillər əlavə edin."),
	body("startDate").isISO8601().withMessage("Başlama tarixini daxil edin."),
	body("endDate").isISO8601().withMessage("Bitmə tarixini daxil edin."),
	// body("ownerId").isInt().withMessage("Hərrac yaradıcısı yoxdur."),
	body("manufacturer").isString().notEmpty().withMessage("İstehsalçını seçın."),
	body("model").isString().notEmpty().withMessage("Model seçin."),
	body("category").isString().notEmpty().withMessage("Kateqoriyanı daxil edin"),
	body("year").isInt({ min: 1886 }).toInt().withMessage("İli daxil edin."),
	body("engineCapacity").isFloat({ min: 0 }).toFloat().withMessage("Mühərrikin həcmini daxil edin."),
	body("fuelType").isString().notEmpty().withMessage("Yanacaq növünü daxil edin."),
	body("color").isString().notEmpty().withMessage("Rəng seçin."),
	body("kilometrage").isInt({ min: 0 }).toInt().withMessage("Kilometr daxil edin."),
	body("leadSide").isString().notEmpty().withMessage("Aparıcı tərəfi seçin."),
	body("vinCode").isString().notEmpty().withMessage("VIN kod daxil edin."),
	body("horsePower").isInt({ min: 0 }).toInt().withMessage("At gücü daxil edin."),
	body("brakingSystem").isString().notEmpty().withMessage("Əyləc sistemi seçin."),
	body("city").isString().notEmpty().withMessage("Şəhər seçin."),
	body("country").isString().notEmpty().withMessage("Bazar seçin."),
	body("insurance").isString().notEmpty().withMessage("Siğorta sənədi yükləyin."),
	body("techInspection").isString().notEmpty().withMessage("Texniki yoxlanış sənədi yükləyin."),
	body("wheelSide").isString().notEmpty().withMessage("Sükan yerini seçin."),
	body("transmission").isString().notEmpty().withMessage("Otürücü novü seçin."),
];