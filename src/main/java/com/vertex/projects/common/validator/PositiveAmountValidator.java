package com.vertex.projects.common.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.math.BigDecimal;

/**
 * Implementation of ValidPositiveAmount constraint validator
 */
public class PositiveAmountValidator implements ConstraintValidator<ValidPositiveAmount, BigDecimal> {

    @Override
    public void initialize(ValidPositiveAmount constraintAnnotation) {
    }

    @Override
    public boolean isValid(BigDecimal value, ConstraintValidatorContext context) {
        if (value == null) {
            return true;
        }
        return value.signum() > 0;
    }
}
